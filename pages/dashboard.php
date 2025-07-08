<?php
require_once '../includes/db.php';
require_once '../includes/header.php'; // ใช้งาน header (ซึ่งควรมี session_start() แล้ว)
require_once '../includes/auth.php';
requireAdmin(); // ตรวจสอบสิทธิ์ Admin

// ✅ ฟังก์ชันใหม่: ดึงข้อมูลความคืบหน้าโดยรวมของนักเรียน
function getOverallStudentProgress($conn, $user_id) {
    // 1. ดึงจำนวนด่านที่นักเรียนทำสำเร็จทั้งหมด (ไม่ซ้ำด่าน)
    $stmt = $conn->prepare("SELECT COUNT(DISTINCT stage_id) AS completed_stages FROM progress WHERE user_id = ? AND completed_at IS NOT NULL");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $completedStages = $result->fetch_assoc()['completed_stages'] ?? 0;
    $stmt->close();

    // 2. ดึงจำนวนด่านทั้งหมดที่มีในระบบ
    $stmt = $conn->prepare("SELECT COUNT(id) AS total_available_stages FROM stages");
    $stmt->execute();
    $result = $stmt->get_result();
    $totalAvailableStages = $result->fetch_assoc()['total_available_stages'] ?? 0;
    $stmt->close();

    // 3. ดึงจำนวนบทเรียนทั้งหมด (จากตาราง games)
    $stmt = $conn->prepare("SELECT id, title FROM games");
    $stmt->execute();
    $allGames = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $totalLessons = count($allGames);
    $completedLessons = 0;

    // 4. ตรวจสอบว่าแต่ละบทเรียน (เกม) ทำสำเร็จครบทุกด่านหรือยัง
    foreach ($allGames as $game) {
        // นับจำนวนด่านทั้งหมดในบทเรียนนี้
        $stmt = $conn->prepare("SELECT COUNT(id) AS total_game_stages FROM stages WHERE game_id = ?");
        $stmt->bind_param("i", $game['id']);
        $stmt->execute();
        $totalGameStages = $stmt->get_result()->fetch_assoc()['total_game_stages'] ?? 0;
        $stmt->close();

        // นับจำนวนด่านที่นักเรียนทำสำเร็จในบทเรียนนี้
        $stmt = $conn->prepare("
            SELECT COUNT(T1.stage_id) AS completed_game_stages
            FROM progress AS T1
            JOIN stages AS T2 ON T1.stage_id = T2.id
            WHERE T1.user_id = ? AND T2.game_id = ? AND T1.completed_at IS NOT NULL
        ");
        $stmt->bind_param("ii", $user_id, $game['id']);
        $stmt->execute();
        $completedGameStages = $stmt->get_result()->fetch_assoc()['completed_game_stages'] ?? 0;
        $stmt->close();

        // ถ้าบทเรียนนี้มีด่าน และจำนวนด่านที่ทำสำเร็จเท่ากับจำนวนด่านทั้งหมดในบทเรียนนั้นๆ
        if ($totalGameStages > 0 && $completedGameStages == $totalGameStages) {
            $completedLessons++;
        }
    }

    return [
        'completed_stages' => $completedStages,
        'total_stages' => $totalAvailableStages,
        'completed_lessons' => $completedLessons,
        'total_lessons' => $totalLessons
    ];
}

// ดึงข้อมูลนักเรียนทั้งหมด (เหมือนเดิม)
$sql = "SELECT id, student_id, name, class_level, created_at FROM users WHERE role = 'student' ORDER BY class_level, name";
$result = $conn->query($sql);
?>

<?php if (isset($_GET['deleted'])): ?>
    <div class="alert alert-success">
        ✅ ลบผู้ใช้ <strong><?= htmlspecialchars((string)urldecode($_GET['deleted'])) ?></strong> เรียบร้อยแล้ว
    </div>
<?php elseif (isset($_GET['deleted_count'])): ?>
    <div class="alert alert-success">
        ✅ ลบผู้ใช้จำนวน <strong><?= (int)$_GET['deleted_count'] ?></strong> คนเรียบร้อยแล้ว
    </div>
<?php elseif (isset($_GET['error']) && $_GET['error'] === 'cannot_delete_admin'): ?>
    <div class="alert alert-danger">
        ❌ ไม่สามารถลบผู้ดูแลระบบได้
    </div>
<?php elseif (isset($_GET['error']) && $_GET['error'] === 'user_not_found'): ?>
    <div class="alert alert-warning">
        ⚠️ ไม่พบผู้ใช้ที่ต้องการลบ
    </div>
<?php elseif (isset($_GET['error']) && $_GET['error'] === 'delete_failed'): ?>
    <div class="alert alert-danger">
        ❌ เกิดข้อผิดพลาดในการลบผู้ใช้ กรุณาลองใหม่อีกครั้ง
    </div>
<?php endif; ?>


<h1>แดชบอร์ดผู้ดูแลระบบ</h1>

<p>
  <a href="add_user.php" class="btn btn-success btn-sm">+ เพิ่มนักเรียน</a>
  <a href="import_students.php" class="btn btn-primary btn-sm">+ นำเข้านักเรียน</a>
    <a href="leaderboard.php" class="btn btn-info btn-sm">🏆 Leader Board</a>
</p>

<form method="post" action="delete_multiple_users.php" onsubmit="return confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ที่เลือก?');">
<div class="table-responsive">
  <table class="table table-bordered table-hover">
    <thead class="table-light">
      <tr>
        <th><input type="checkbox" id="select_all"></th>
        <th>ลำดับ</th>
        <th>ชื่อบัญชี</th>
        <th>ชื่อ - สกุล</th>
        <th>ชั้นเรียน</th>
        <th>ความคืบหน้า (บท)</th>
        <th>ความคืบหน้า (ด่าน)</th>
        <th>วันที่เพิ่มบัญชี</th>
        <th>การจัดการ</th>
      </tr>
    </thead>
    <tbody>
      <?php
      $index = 1;
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // ✅ ดึงข้อมูลความคืบหน้าของนักเรียนแต่ละคน ✅
            $overall_progress = getOverallStudentProgress($conn, $row['id']);
            
            // ✅ คำนวณเปอร์เซ็นต์สำหรับ Progress Bar ✅
            $lesson_percent = ($overall_progress['total_lessons'] > 0) ? round(($overall_progress['completed_lessons'] / $overall_progress['total_lessons']) * 100) : 0;
            $stage_percent = ($overall_progress['total_stages'] > 0) ? round(($overall_progress['completed_stages'] / $overall_progress['total_stages']) * 100) : 0;

            echo "<tr>
                  <td><input type='checkbox' name='user_ids[]' value='{$row['id']}' class='form-check-input'></td>
                  <td>{$index}</td>
                  <td>" . htmlspecialchars($row['student_id']) . "</td>
                  <td>" . htmlspecialchars($row['name']) . "</td>
                  <td>" . htmlspecialchars($row['class_level']) . "</td>
                  <td>
                      <div class='progress' style='height: 25px;'>
                          <div class='progress-bar bg-info' role='progressbar' style='width: {$lesson_percent}%;' aria-valuenow='{$lesson_percent}' aria-valuemin='0' aria-valuemax='100'>
                              {$overall_progress['completed_lessons']}/{$overall_progress['total_lessons']}
                          </div>
                      </div>
                  </td>
                  <td>
                      <div class='progress' style='height: 25px;'>
                          <div class='progress-bar bg-success' role='progressbar' style='width: {$stage_percent}%;' aria-valuenow='{$stage_percent}' aria-valuemin='0' aria-valuemax='100'>
                              {$overall_progress['completed_stages']}/{$overall_progress['total_stages']}
                          </div>
                      </div>
                  </td>
                  <td>" . date('d/m/Y', strtotime($row['created_at'])) . "</td>
                  <td>
                    <a href='edit_user.php?id={$row['id']}' class='btn btn-warning btn-sm'>แก้ไข</a>
                    <a href='delete_user.php?id={$row['id']}' class='btn btn-danger btn-sm' onclick=\"return confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้?');\">ลบ</a>
                  </td>
                </tr>";
          $index++;
        }
      } else {
        echo "<tr><td colspan='9' class='text-center'>ไม่มีข้อมูลนักเรียน</td></tr>";
      }
      ?>
    </tbody>
  </table>
</div>

<button type="submit" class="btn btn-danger btn-sm mt-2">ลบผู้ใช้ที่เลือก</button>
</form>

<script>
  // Checkbox เลือกทั้งหมด (เหมือนเดิม)
  document.getElementById('select_all').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('input[name="user_ids[]"]').forEach(cb => cb.checked = checked);
  });
</script>

<?php include '../includes/footer.php'; ?>