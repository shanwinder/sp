<?php
require_once '../includes/db.php';
require_once '../includes/header.php';
require_once '../includes/auth.php';
requireAdmin();

$user_id = $_GET['id'] ?? null;
$error = '';
$updated = false;

// ตรวจสอบว่ามี id และผู้ใช้มีอยู่จริง
if (!$user_id) {
    header("Location: dashboard.php");
    exit();
}

$stmt = $conn->prepare("SELECT id, student_id, name, class_level, role FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header("Location: dashboard.php");
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

// กดปุ่มบันทึก
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = trim($_POST['student_id']);
    $name = trim($_POST['name']);
    $class_level = $_POST['class_level'] !== '' ? trim($_POST['class_level']) : null;
    $role = $_POST['role'];

    // อัปเดตข้อมูล
    $stmt = $conn->prepare("UPDATE users SET student_id = ?, name = ?, class_level = ?, role = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $student_id, $name, $class_level, $role, $user_id);

    if ($stmt->execute()) {
        $updated = true;
        $user['student_id'] = $student_id;
        $user['name'] = $name;
        $user['class_level'] = $class_level;
        $user['role'] = $role;
    } else {
        $error = "❌ ไม่สามารถอัปเดตข้อมูลได้: " . $stmt->error;
    }
    $stmt->close();
}
?>

<div class="container py-4">
    <h2 class="mb-4">แก้ไขข้อมูลผู้ใช้</h2>
    <a href="dashboard.php" class="btn btn-secondary mb-3">← กลับไปยังแดชบอร์ด</a>

    <?php if ($updated): ?>
        <div class="alert alert-success">✅ บันทึกการแก้ไขเรียบร้อยแล้ว</div>
    <?php elseif ($error): ?>
        <div class="alert alert-danger"><?= $error ?></div>
    <?php endif; ?>

    <form method="post">
        <div class="mb-3">
            <label for="student_id" class="form-label">รหัสผู้ใช้ / รหัสนักเรียน</label>
            <input type="text" name="student_id" id="student_id" class="form-control" value="<?= htmlspecialchars($user['student_id']) ?>" required>
        </div>

        <div class="mb-3">
            <label for="name" class="form-label">ชื่อ - นามสกุล</label>
            <input type="text" name="name" id="name" class="form-control" value="<?= htmlspecialchars($user['name']) ?>" required>
        </div>

        <div class="mb-3">
            <label for="class_level" class="form-label">ชั้นเรียน</label>
            <select name="class_level" id="class_level" class="form-select">
                <option value="" <?= $user['class_level'] === null ? 'selected' : '' ?>>ไม่ระบุ</option>
                <option value="ป.1" <?= $user['class_level'] === 'ป.1' ? 'selected' : '' ?>>ป.1</option>
                <option value="ป.2" <?= $user['class_level'] === 'ป.2' ? 'selected' : '' ?>>ป.2</option>
                <option value="ป.3" <?= $user['class_level'] === 'ป.3' ? 'selected' : '' ?>>ป.3</option>
                <option value="ป.4" <?= $user['class_level'] === 'ป.4' ? 'selected' : '' ?>>ป.4</option>
                <option value="ป.5" <?= $user['class_level'] === 'ป.5' ? 'selected' : '' ?>>ป.5</option>
                <option value="ป.6" <?= $user['class_level'] === 'ป.6' ? 'selected' : '' ?>>ป.6</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="role" class="form-label">สิทธิ์ผู้ใช้</label>
            <select name="role" id="role" class="form-select" required>
                <option value="student" <?= $user['role'] === 'student' ? 'selected' : '' ?>>นักเรียน</option>
                <option value="admin" <?= $user['role'] === 'admin' ? 'selected' : '' ?>>ผู้ดูแลระบบ</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary">💾 บันทึกการแก้ไข</button>
    </form>
</div>

<?php include '../includes/footer.php'; ?>
