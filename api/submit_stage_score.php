<?php
// File: api/submit_stage_score.php
session_start();
require_once '../includes/db.php';

// ตรวจสอบว่าเป็น request แบบ POST และมี user_id ใน session
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $stage_id = intval($_POST['stage_id']);
    $score = intval($_POST['score']); // คะแนนที่ได้รับจากเกมในด่านนั้นๆ

    // กำหนดค่าสำหรับ completed_at และ action/detail สำหรับ game_logs
    $completed_at = null;
    $action = 'fail';
    $detail_score = $score; // เก็บ score ที่ส่งมาใน detail

    // เงื่อนไขการผ่านด่าน: ถ้าคะแนนที่ได้คือ 100
    if ($score === 100) { // สามารถปรับเปลี่ยนเงื่อนไขการผ่านได้ เช่น score >= X
        $completed_at = date('Y-m-d H:i:s');
        $action = 'pass';
    }

    // 1. บันทึก/อัปเดตข้อมูลในตาราง 'progress'
    // เราจะใช้ ON DUPLICATE KEY UPDATE เพื่อจัดการทั้งการเพิ่มใหม่และการอัปเดต
    // เพิ่ม attempts และอัปเดต score/completed_at
    $stmt_progress = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, attempts, completed_at)
                                     VALUES (?, ?, ?, 1, ?)
                                     ON DUPLICATE KEY UPDATE
                                     score = VALUES(score),
                                     attempts = attempts + 1,
                                     completed_at = VALUES(completed_at)");
    $stmt_progress->bind_param("iiis", $user_id, $stage_id, $score, $completed_at);
    $stmt_progress->execute();
    $stmt_progress->close();

    // 2. บันทึกข้อมูลในตาราง 'game_logs'
    // 'detail' จะเก็บข้อมูล score ในรูปแบบ JSON
    $detail_json = json_encode(['score' => $detail_score]);
    $stmt_log = $conn->prepare("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)");
    $stmt_log->bind_param("iiss", $user_id, $stage_id, $action, $detail_json);
    $stmt_log->execute();
    $stmt_log->close();

    echo json_encode(['status' => 'ok']);
    exit;
}

// ถ้าไม่ใช่ POST request หรือไม่มี user_id
echo json_encode(['status' => 'error', 'message' => 'Invalid request or not logged in.']);
exit;