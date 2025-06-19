<?php
require_once '../includes/db.php';
require_once '../includes/auth.php';
requireAdmin();

// ตรวจสอบว่าเป็น POST และมี user_ids[] ส่งมา
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['user_ids']) || !is_array($_POST['user_ids'])) {
    header('Location: dashboard.php');
    exit();
}

$user_ids = array_map('intval', $_POST['user_ids']); // แปลงเป็นตัวเลขป้องกัน SQL injection
$deleted_count = 0;

foreach ($user_ids as $user_id) {
    // ตรวจสอบก่อนว่าผู้ใช้นั้นไม่ใช่ admin
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        continue; // ข้ามถ้าไม่เจอ
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user['role'] === 'admin') {
        continue; // ห้ามลบ admin
    }

    // ลบผู้ใช้
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    if ($stmt->execute()) {
        $deleted_count++;
    }
    $stmt->close();
}

// กลับไปแสดงผลที่ dashboard
header("Location: dashboard.php?deleted_count=$deleted_count");
exit();
