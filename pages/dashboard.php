<?php
require_once '../includes/db.php';
require_once '../includes/header.php'; // ✅ ใช้งาน header
require_once '../includes/auth.php';
requireAdmin();

// ดึงข้อมูลนักเรียนทั้งหมด
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
        <th>วันที่เพิ่มบัญชี</th>
        <th>การจัดการ</th>
      </tr>
    </thead>
    <tbody>
      <?php
      $index = 1;
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
          echo "<tr>
                  <td><input type='checkbox' name='user_ids[]' value='{$row['id']}'></td>
                  <td>{$index}</td>
                  <td>" . htmlspecialchars($row['student_id']) . "</td>
                  <td>" . htmlspecialchars($row['name']) . "</td>
                  <td>" . htmlspecialchars($row['class_level']) . "</td>
                  <td>" . date('d/m/Y', strtotime($row['created_at'])) . "</td>
                  <td>
                    <a href='edit_user.php?id={$row['id']}' class='btn btn-warning btn-sm'>แก้ไข</a>
                    <a href='delete_user.php?id={$row['id']}' class='btn btn-danger btn-sm' onclick=\"return confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้?');\">ลบ</a>
                  </td>
                </tr>";
          $index++;
        }
      } else {
        echo "<tr><td colspan='7' class='text-center'>ไม่มีข้อมูลนักเรียน</td></tr>";
      }
      ?>
    </tbody>
  </table>
</div>

<button type="submit" class="btn btn-danger btn-sm mt-2">ลบผู้ใช้ที่เลือก</button>
</form>

<script>
  // Checkbox เลือกทั้งหมด
  document.getElementById('select_all').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('input[name="user_ids[]"]').forEach(cb => cb.checked = checked);
  });
</script>

<?php include '../includes/footer.php'; // ✅ ใช้งาน footer ?>
