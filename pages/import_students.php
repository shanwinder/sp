<?php
require_once '../includes/db.php';
require_once '../includes/header.php';
require_once '../includes/auth.php';
requireAdmin();

$imported_students = [];
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
    $file = $_FILES['csv_file']['tmp_name'];
    $filename = $_FILES['csv_file']['name'];
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    if ($extension !== 'csv') {
        $error_message = "❌ กรุณาอัปโหลดเฉพาะไฟล์ .csv เท่านั้น";
    } elseif (($handle = fopen($file, "r")) !== FALSE) {
        fgetcsv($handle); // ข้ามแถวหัวตาราง

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $student_id = trim($data[0]);
            $name = trim($data[1]);
            $class_level = trim($data[2]);
            $password_raw = trim($data[3]);

            if (empty($student_id) || empty($name) || empty($password_raw)) {
                continue; // ข้ามถ้ามีข้อมูลไม่ครบ
            }

            // ตรวจสอบ student_id ซ้ำ
            $check = $conn->prepare("SELECT id FROM users WHERE student_id = ?");
            $check->bind_param("s", $student_id);
            $check->execute();
            $check->store_result();

            if ($check->num_rows === 0) {
                $hashed_password = password_hash($password_raw, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role) VALUES (?, ?, ?, ?, 'student')");
                $stmt->bind_param("ssss", $student_id, $name, $class_level, $hashed_password);
                $stmt->execute();
                $stmt->close();

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
            $success_message = "✅ นำเข้าข้อมูลสำเร็จจำนวน " . count($imported_students) . " รายชื่อ";
        } else {
            $error_message = "⚠️ ไม่มีข้อมูลใหม่ถูกเพิ่ม (student_id อาจซ้ำ หรือข้อมูลไม่ครบ)";
        }
    } else {
        $error_message = "❌ ไม่สามารถอ่านไฟล์ CSV ได้";
    }
}
?>

<div class="container py-4">
    <h1 class="mb-4">นำเข้านักเรียนจากไฟล์ CSV</h1>

    <a href="dashboard.php" class="btn btn-secondary mb-3">← กลับไปยังแดชบอร์ด</a>

    <?php if ($success_message): ?>
        <div class="alert alert-success"><?= $success_message ?></div>
    <?php endif; ?>
    <?php if ($error_message): ?>
        <div class="alert alert-danger"><?= $error_message ?></div>
    <?php endif; ?>

    <form action="import_students.php" method="post" enctype="multipart/form-data" class="mb-4">
        <div class="mb-3">
            <label for="csv_file" class="form-label">เลือกไฟล์ .csv</label>
            <input type="file" name="csv_file" id="csv_file" class="form-control" accept=".csv" required>
        </div>
        <button type="submit" name="import" class="btn btn-success">นำเข้า</button>
    </form>

    <?php if (!empty($imported_students)): ?>
        <h4>รายการที่นำเข้าสำเร็จ:</h4>
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
</div>

<?php include '../includes/footer.php'; ?>
