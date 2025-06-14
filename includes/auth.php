<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// ตรวจสอบว่าเป็นผู้ดูแลระบบหรือไม่
function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

// ตรวจสอบว่าเป็นนักเรียนหรือไม่
function isStudent() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'student';
}

// ถ้าผู้ใช้ยังไม่ได้ล็อกอิน → redirect ไปหน้า login
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: ../pages/login.php");
        exit();
    }
}

// จำกัดเฉพาะผู้ดูแลระบบเท่านั้น
function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        header("Location: ../pages/login.php");
        exit();
    }
}

// จำกัดเฉพาะนักเรียนเท่านั้น
function requireStudent() {
    requireLogin();
    if (!isStudent()) {
        header("Location: ../pages/login.php");
        exit();
    }
}
?>
