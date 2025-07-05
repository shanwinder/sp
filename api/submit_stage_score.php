<?php
// File: api/submit_stage_score.php
// ทำหน้าที่รับคะแนนดาว (0-3 ดาว) จากเกมในแต่ละด่าน และบันทึกลงฐานข้อมูล

// เปิดการแสดงผล Error สำหรับการ Debug (ควรลบออกเมื่อนำขึ้น Production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// เริ่ม session หากยังไม่ได้เริ่ม
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เรียกไฟล์เชื่อมต่อฐานข้อมูล
require_once '../includes/db.php';

// ตรวจสอบว่าเป็น request แบบ POST และมี user_id ใน session
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $stage_id = intval($_POST['stage_id']);
    $stars_earned = intval($_POST['stars_earned']); // จำนวนดาวที่ได้รับ
    $duration_seconds = intval($_POST['duration_seconds'] ?? 0); // ✅ รับ duration_seconds
    $attempts = intval($_POST['attempts'] ?? 1); // ✅ รับ attempts

    // กำหนดเวลาที่ทำด่านสำเร็จ
    $completed_at = date('Y-m-d H:i:s');

    // ✅ FIX: กำหนดค่า 'action' ให้ตรงตาม ENUM ในฐานข้อมูล
    //        'pass' ถ้าได้ดาวมากกว่า 0, 'fail' ถ้าได้ 0 ดาว หรือ 'submit' เสมอ
    $action_log = ($stars_earned > 0) ? 'pass' : 'fail';
    // หรือถ้าอยากให้เป็น 'submit' เสมอเมื่อมีการส่งผล
    // $action_log = 'submit'; 

    // เก็บรายละเอียดคะแนนดาวและข้อมูลอื่นๆ ในรูปแบบ JSON สำหรับ game_logs
    $detail_json = json_encode([
        'stars_earned' => $stars_earned,
        'duration_seconds' => $duration_seconds,
        'attempts' => $attempts
    ]);

    // 1. ตรวจสอบคะแนนดาวเดิมที่นักเรียนเคยทำได้สำหรับด่านนี้
    $stmt_check_progress = $conn->prepare("SELECT score FROM progress WHERE user_id = ? AND stage_id = ?");
    $stmt_check_progress->bind_param("ii", $user_id, $stage_id);
    $stmt_check_progress->execute();
    $result_check_progress = $stmt_check_progress->get_result();
    $existing_score = 0;
    if ($result_check_progress->num_rows > 0) {
        $row = $result_check_progress->fetch_assoc();
        $existing_score = $row['score'];
    }
    $stmt_check_progress->close();

    // 2. กำหนดคะแนนดาวที่จะบันทึก (เลือกค่าสูงสุดระหว่างดาวที่ได้ใหม่กับดาวเดิม)
    $new_score_to_save = max($stars_earned, $existing_score);

    // 3. บันทึก/อัปเดตข้อมูลในตาราง 'progress'
    $stmt_progress = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, duration_seconds, attempts, completed_at)
                                     VALUES (?, ?, ?, ?, ?, ?)
                                     ON DUPLICATE KEY UPDATE
                                     score = VALUES(score),
                                     duration_seconds = VALUES(duration_seconds),
                                     attempts = attempts + 1,
                                     completed_at = VALUES(completed_at)");

    // 'iiiiss' คือประเภทของพารามิเตอร์: user_id (int), stage_id (int), score (int), duration (int), attempts (int), completed_at (string)
    $stmt_progress->bind_param("iiiiss", $user_id, $stage_id, $new_score_to_save, $duration_seconds, $attempts, $completed_at);
    $stmt_progress->execute();
    $stmt_progress->close();

    // 4. บันทึกข้อมูลในตาราง 'game_logs'
    $stmt_log = $conn->prepare("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)");
    $stmt_log->bind_param("iiss", $user_id, $stage_id, $action_log, $detail_json);
    $stmt_log->execute();
    $stmt_log->close();

    echo json_encode(['status' => 'ok', 'stars_saved' => $new_score_to_save, 'action_logged' => $action_log]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid request or not logged in.']);
exit;