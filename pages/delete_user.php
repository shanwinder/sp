<?php
require_once '../includes/db.php';
require_once '../includes/auth.php';
requireAdmin();

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('Location: dashboard.php');
    exit();
}

$user_id = (int) $_GET['id'];

// ดึงข้อมูลชื่อผู้ใช้ก่อนลบ
$stmt = $conn->prepare("SELECT name, role FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Location: dashboard.php?error=user_not_found');
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

if ($user['role'] === 'admin') {
    header('Location: dashboard.php?error=cannot_delete_admin');
    exit();
}

// ลบผู้ใช้
// ... โค้ดดึงข้อมูลผู้ใช้ ...

// ลบผู้ใช้
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    $stmt->close();

    // encode ชื่อผู้ใช้ให้ปลอดภัยสำหรับ URL
    $deleted_name = rawurlencode($user['name']);
    header("Location: dashboard.php?deleted=$deleted_name");
    exit();
} else {
    $stmt->close();
    header("Location: dashboard.php?error=delete_failed");
    exit();
}


// ส่งชื่อกลับไปยัง dashboard
$deleted_name = urlencode($user['name']);
var_dump($user['name']); exit;
header("Location: dashboard.php?deleted=$deleted_name");
exit();
