<?php 
require_once '../includes/db.php';
require_once '../includes/header.php'; // ✅ ใช้งาน header
require_once '../includes/auth.php';
requireAdmin();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $student_id = trim($_POST["student_id"]);
    $name = trim($_POST["name"]);
    $password = trim($_POST["password"]);
    $class_level = trim($_POST["class_level"]);

    // เข้ารหัสรหัสผ่าน
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // SQL เพิ่มนักเรียน
    $sql = "INSERT INTO users (student_id, name, class_level, password, role, created_at)
            VALUES (?, ?, ?, ?, 'student', NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $student_id, $name, $class_level, $hashed_password);

    if ($stmt->execute()) {
        $message = "✅ เพิ่มนักเรียนเรียบร้อยแล้ว!";
    } else {
        $message = "❌ เกิดข้อผิดพลาด: " . $conn->error;
    }

    $stmt->close();
}
?>

<div class="form-container bg-warning-subtle rounded p-4" style="max-width: 500px; margin: auto;">
    <h2 class="text-center mb-4 text-danger">เพิ่มนักเรียนใหม่</h2>

    <?php if (isset($message)): ?>
        <div class="alert alert-info"><?php echo $message; ?></div>
    <?php endif; ?>

    <form method="post" action="">
        <div class="mb-3">
            <label for="student_id" class="form-label">รหัสนักเรียน</label>
            <input type="text" class="form-control" id="student_id" name="student_id" required>
        </div>

        <div class="mb-3">
            <label for="name" class="form-label">ชื่อ-นามสกุล</label>
            <input type="text" class="form-control" id="name" name="name" required>
        </div>

        <div class="mb-3">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input type="password" class="form-control" id="password" name="password" required>
        </div>

        <div class="mb-3">
            <label for="class_level" class="form-label">ชั้นเรียน</label>
            <select class="form-select" name="class_level" id="class_level" required>
                <option value="">-- เลือกชั้นเรียน --</option>
                <option value="ป.1">ป.1</option>
                <option value="ป.2">ป.2</option>
                <option value="ป.3">ป.3</option>
                <option value="ป.4">ป.4</option>
                <option value="ป.5">ป.5</option>
                <option value="ป.6">ป.6</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary w-100">บันทึกนักเรียน</button>
        <a href="dashboard.php" class="btn btn-secondary w-100 mt-2">← กลับแดชบอร์ด</a>
    </form>
</div>

<?php include '../includes/footer.php'; ?>
