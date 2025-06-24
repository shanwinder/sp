<?php
session_start();
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $stage_id = intval($_POST['stage_id']);
    $score = intval($_POST['score']);

    // ตรวจสอบว่ามีการบันทึกแล้วหรือยัง
    $check = $conn->prepare("SELECT id FROM progress WHERE user_id = ? AND stage_id = ?");
    $check->bind_param("ii", $user_id, $stage_id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        // อัปเดตคะแนน (กันผู้เล่นเล่นใหม่แล้วได้คะแนนเพิ่ม)
        $update = $conn->prepare("UPDATE progress SET score = ? WHERE user_id = ? AND stage_id = ?");
        $update->bind_param("iii", $score, $user_id, $stage_id);
        $update->execute();
    } else {
        // เพิ่มคะแนนใหม่
        $insert = $conn->prepare("INSERT INTO progress (user_id, stage_id, score) VALUES (?, ?, ?)");
        $insert->bind_param("iii", $user_id, $stage_id, $score);
        $insert->execute();
    }

    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['status' => 'error']);
exit;
