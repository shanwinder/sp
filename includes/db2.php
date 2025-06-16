<?php
$host = 'sql303.infinityfree.com';
$user = 'if0_39235101';
$pass = 'PDj2O0OWiJPYEm';
$db   = 'if0_39235101_learning_game'; // ให้ชื่อฐานข้อมูลตรงกับของคุณ

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("เชื่อมต่อฐานข้อมูลล้มเหลว: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4"); // หรือ utf8mb4

?>