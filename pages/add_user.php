<?php
require_once '../includes/db.php';
require_once '../includes/auth.php';
require_once '../includes/header.php';
requireAdmin();

$success = false;
$error = '';

// ถ้ามีการส่งข้อมูล
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $student_id = trim($_POST["student_id"]);
    $name = trim($_POST["name"]);
    $class_level = trim($_POST["class_level"]);
    $password = trim($_POST["password"]);
    $role = $_POST["role"];

    // ตรวจสอบซ้ำ
    $stmt = $conn->prepare("SELECT id FROM users WHERE student_id = ?");
    $stmt->bind_param("s", $student_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $error = "❌ รหัสผู้ใช้นี้มีอยู่ในระบบแล้ว";
    } else {
        $stmt->close();

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $student_id, $name, $class_level, $hashed_password, $role);

        if ($stmt->execute()) {
            $success = true;
        } else {
            $error = "❌ เกิดข้อผิดพลาด: " . $stmt->error;
        }
        $stmt->close();
    }
}
?>

<div class="container mt-5">
    <h2 class="mb-4 text-primary">เพิ่มผู้ใช้ใหม่</h2>

    <?php if ($success): ?>
        <div class="alert alert-success">✅ เพิ่มผู้ใช้เรียบร้อยแล้ว!</div>
    <?php elseif ($error): ?>
        <div class="alert alert-danger"><?php echo $error; ?></div>
    <?php endif; ?>
    <a href="dashboard.php" class="btn btn-secondary mb-3">← กลับไปยังแดชบอร์ด</a>
    <form method="post">
        <div class="mb-3">
            <label for="student_id" class="form-label">ชื่อบัญชี</label>
            <input type="text" class="form-control" name="student_id" id="student_id" required>
        </div>

        <div class="mb-3">
            <label for="name" class="form-label">ชื่อ - สกุล</label>
            <input type="text" class="form-control" name="name" id="name" required>
        </div>

        <div class="mb-3">
            <label for="class_level" class="form-label">ชั้นเรียน</label>
            <select name="class_level" id="class_level" class="form-select">
                <option value="">-- ไม่ระบุ --</option>
                <option value="ป.1">ป.1</option>
                <option value="ป.2">ป.2</option>
                <option value="ป.3">ป.3</option>
                <option value="ป.4">ป.4</option>
                <option value="ป.5">ป.5</option>
                <option value="ป.6">ป.6</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input type="password" class="form-control" name="password" id="password" required>
        </div>

        <div class="mb-3">
            <label for="role" class="form-label">สิทธิ์การใช้งาน</label>
            <select name="role" id="role" class="form-select" required>
                <option value="student">นักเรียน</option>
                <option value="admin">ผู้ดูแลระบบ</option>
            </select>
        </div>

        <button type="submit" class="btn btn-success w-100">เพิ่มผู้ใช้</button>
    </form>
</div>

<?php include '../includes/footer.php'; ?>