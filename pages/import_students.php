<?php
require_once '../includes/db.php';
require_once '../includes/header.php'; // ถ้ามี header สำหรับแสดง UI
require_once '../includes/auth.php';
requireAdmin();

$imported_students = [];
$error_message = '';
$success_message = '';

if (isset($_POST['import'])) {
    $file = $_FILES['csv_file']['tmp_name'];

    if ($_FILES['csv_file']['type'] !== 'text/csv') {
        $error_message = "กรุณาอัปโหลดเฉพาะไฟล์ .csv เท่านั้น";
    } elseif (($handle = fopen($file, "r")) !== FALSE) {
        fgetcsv($handle); // ข้ามหัวตาราง
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $student_id = trim($data[0]);
            $name = trim($data[1]);
            $class_level = trim($data[2]);
            $password_raw = trim($data[3]);
            $password = password_hash($password_raw, PASSWORD_DEFAULT);

            // ตรวจสอบว่า student_id ซ้ำหรือไม่
            $check = $conn->prepare("SELECT id FROM users WHERE student_id = ?");
            $check->bind_param("s", $student_id);
            $check->execute();
            $check->store_result();

            if ($check->num_rows == 0) {
                $stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role) VALUES (?, ?, ?, ?, 'student')");
                $stmt->bind_param("ssss", $student_id, $name, $class_level, $password);
                $stmt->execute();
                $imported_students[] = [
                    'student_id' => $student_id,
                    'name' => $name,
                    'class_level' => $class_level
                ];
            }
            $check->close();
        }
        fclose($handle);

        if (count($imported_students) > 0) {
            $success_message = "นำเข้าข้อมูลสำเร็จ " . count($imported_students) . " รายชื่อ";
        } else {
            $error_message = "ไม่มีข้อมูลใหม่ถูกเพิ่ม เนื่องจาก student_id ซ้ำทั้งหมด";
        }
    } else {
        $error_message = "ไม่สามารถอ่านไฟล์ได้";
    }
}
?>


    <h1>นำเข้านักเรียนจากไฟล์ .CSV</h1>

    <!-- ปุ่มกลับไปแดชบอร์ด -->
    <a href="dashboard.php" class="btn btn-secondary mb-3">← กลับไปยังแดชบอร์ด</a>

    <?php if ($success_message): ?>
        <p class="success"><?= $success_message ?></p>
    <?php endif; ?>
    <?php if ($error_message): ?>
        <p class="error"><?= $error_message ?></p>
    <?php endif; ?>

    <form action="import_students.php" method="post" enctype="multipart/form-data">
        <label>เลือกไฟล์ .csv:</label>
        <input type="file" name="csv_file" accept=".csv" required>
        <button type="submit" name="import" class="btn btn-success btn-sm">นำเข้า</button>
    </form>

    <?php if (count($imported_students) > 0): ?>
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ</th>
                    <th>ชั้นเรียน</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($imported_students as $student): ?>
                    <tr>
                        <td><?= htmlspecialchars($student['student_id']) ?></td>
                        <td><?= htmlspecialchars($student['name']) ?></td>
                        <td><?= htmlspecialchars($student['class_level']) ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
<?php include '../includes/footer.php'; // ✅ ใช้งาน footer ?>
</html>
