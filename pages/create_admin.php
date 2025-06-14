<?php
require_once '../includes/db.php';

$created = false;
$error = '';

// ตรวจสอบว่ามีการส่งฟอร์มหรือไม่
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $admin_id = trim($_POST["admin_id"]);
    $name = trim($_POST["name"]);
    $password = trim($_POST["password"]);

    // ตรวจสอบว่าชื่อผู้ใช้นี้มีอยู่แล้วหรือไม่
    $stmt = $conn->prepare("SELECT id FROM users WHERE student_id = ?");
    $stmt->bind_param("s", $admin_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $error = "❌ มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว";
    } else {
        // บันทึกข้อมูลแอดมิน
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (student_id, name, password, role) VALUES (?, ?, ?, 'admin')");
        $stmt->bind_param("sss", $admin_id, $name, $hashed_password);

        if ($stmt->execute()) {
            $created = true;
        } else {
            $error = "❌ ไม่สามารถสร้างผู้ดูแลได้: " . $stmt->error;
        }
    }
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สร้างผู้ดูแลระบบ</title>
    <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: #f1f5f9;
            padding: 40px;
        }

        .form-box {
            max-width: 500px;
            margin: auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        h2 {
            text-align: center;
            color: #0d6efd;
            margin-bottom: 25px;
        }
    </style>
</head>
<body>

<div class="form-box">
    <h2>สร้างผู้ดูแลระบบ</h2>

    <?php if ($created): ?>
        <div class="alert alert-success">✅ สร้างบัญชีผู้ดูแลระบบเรียบร้อยแล้ว!</div>
    <?php elseif ($error): ?>
        <div class="alert alert-danger"><?php echo $error; ?></div>
    <?php endif; ?>

    <form method="post">
        <div class="mb-3">
            <label for="admin_id" class="form-label">ชื่อผู้ใช้ (admin ID)</label>
            <input type="text" name="admin_id" id="admin_id" class="form-control" required>
        </div>

        <div class="mb-3">
            <label for="name" class="form-label">ชื่อ-นามสกุล</label>
            <input type="text" name="name" id="name" class="form-control" required>
        </div>

        <div class="mb-3">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input type="password" name="password" id="password" class="form-control" required>
        </div>

        <button type="submit" class="btn btn-primary w-100">สร้างแอดมิน</button>
    </form>
</div>

</body>
</html>
