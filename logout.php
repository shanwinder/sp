<?php
session_start();

// ล้าง session ทั้งหมด
$_SESSION = [];
session_unset();
session_destroy();

// เปลี่ยนเส้นทางไปหน้า login
header("Location: index.php");
exit();
