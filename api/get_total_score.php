<?php
// File: api/get_total_score.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once '../includes/db.php';

function getTotalScore($user_id) {
    global $conn;

    // ตรวจสอบว่ามีข้อมูลใน progress หรือยัง
    $check = $conn->prepare("SELECT COUNT(*) FROM progress WHERE user_id = ?");
    $check->bind_param("i", $user_id);
    $check->execute();
    $check->bind_result($count);
    $check->fetch();
    $check->close();

    // ถ้าไม่มีเลย ให้ใส่ record เริ่มต้นสำหรับด่าน 1 (ID 1)
    if ($count === 0) {
        $init = $conn->prepare("INSERT INTO progress (user_id, stage_id, score) VALUES (?, 1, 0)");
        $init->bind_param("i", $user_id);
        $init->execute();
        $init->close();
    }

    // ดึงคะแนนรวม
    $sql = "SELECT SUM(score) as total_score FROM progress WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($total_score);
    $stmt->fetch();
    $stmt->close();

    return $total_score ?: 0;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_SESSION['user_id'])) {
    $score = getTotalScore($_SESSION['user_id']);
    echo json_encode(['score' => $score]);
    exit;
}
?>