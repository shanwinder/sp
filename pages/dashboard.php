<?php
require_once '../includes/db.php';
require_once '../includes/header.php'; // ✅ ใช้งาน header
require_once '../includes/auth.php';
requireAdmin();

// ดึงข้อมูลนักเรียนทั้งหมด
$sql = "SELECT student_id, name, class_level, created_at FROM users WHERE role = 'student' ORDER BY class_level, name";
$result = $conn->query($sql);
?>

<h1>แดชบอร์ดผู้ดูแลระบบ</h1>

<p><a href="import_students.php" class="btn btn-primary btn-sm">+ นำเข้านักเรียน</a></p>

<div class="table-responsive">
  <table class="table table-bordered table-hover">
    <thead class="table-light">
      <tr>
        <th>ลำดับ</th>
        <th>รหัสนักเรียน</th>
        <th>ชื่อ</th>
        <th>ชั้นเรียน</th>
        <th>วันที่สมัคร</th>
      </tr>
    </thead>
    <tbody>
      <?php
      $index = 1;
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
          echo "<tr>
                  <td>{$index}</td>
                  <td>{$row['student_id']}</td>
                  <td>{$row['name']}</td>
                  <td>{$row['class_level']}</td>
                  <td>" . date('d/m/Y', strtotime($row['created_at'])) . "</td>
                </tr>";
          $index++;
        }
      } else {
        echo "<tr><td colspan='5' class='text-center'>ไม่มีข้อมูลนักเรียน</td></tr>";
      }
      ?>
    </tbody>
  </table>
</div>

<?php include '../includes/footer.php'; // ✅ ใช้งาน footer ?>
