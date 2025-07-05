<?php
// File: api/submit_stage_score.php
// ทำหน้าที่รับคะแนนดาว (0-3 ดาว) จากเกมในแต่ละด่าน และบันทึกลงฐานข้อมูล

// เริ่ม session หากยังไม่ได้เริ่ม
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เรียกไฟล์เชื่อมต่อฐานข้อมูล
require_once '../includes/db.php'; // ตรวจสอบให้แน่ใจว่า path ถูกต้อง

// ตรวจสอบว่าเป็น request แบบ POST และมี user_id ใน session
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $stage_id = intval($_POST['stage_id']);
    $stars_earned = intval($_POST['stars_earned']); // ✅ รับค่า 'stars_earned' (จำนวนดาวที่ได้ 0-3)

    // กำหนดเวลาที่ทำด่านสำเร็จ
    $completed_at = date('Y-m-d H:i:s');

    // กำหนด action สำหรับ game_logs (เก็บรายละเอียดว่าได้กี่ดาว)
    $action_log = "stage_completed_{$stars_earned}_stars";
    // เก็บรายละเอียดคะแนนดาวที่ได้รับในรูปแบบ JSON สำหรับ game_logs
    $detail_json = json_encode(['stars_earned' => $stars_earned]);

    // 1. ตรวจสอบคะแนนดาวเดิมที่นักเรียนเคยทำได้สำหรับด่านนี้
    $stmt_check_progress = $conn->prepare("SELECT score FROM progress WHERE user_id = ? AND stage_id = ?");
    $stmt_check_progress->bind_param("ii", $user_id, $stage_id);
    $stmt_check_progress->execute();
    $result_check_progress = $stmt_check_progress->get_result();
    $existing_score = 0;
    if ($result_check_progress->num_rows > 0) {
        $row = $result_check_progress->fetch_assoc();
        $existing_score = $row['score']; // คะแนนดาวที่เคยทำได้
    }
    $stmt_check_progress->close();

    // 2. กำหนดคะแนนดาวที่จะบันทึก (เลือกค่าสูงสุดระหว่างดาวที่ได้ใหม่กับดาวเดิม)
    $new_score_to_save = max($stars_earned, $existing_score);

    // 3. บันทึก/อัปเดตข้อมูลในตาราง 'progress'
    //    ใช้ ON DUPLICATE KEY UPDATE เพื่อจัดการทั้งการเพิ่ม record ใหม่และการอัปเดต record เดิม
    //    score จะเก็บจำนวนดาวสูงสุดที่เคยได้สำหรับด่านนั้น
    //    attempts จะเพิ่มขึ้น 1 ทุกครั้งที่นักเรียนเล่นด่านและส่งผล
    //    completed_at จะบันทึก/อัปเดตเวลาล่าสุดที่เล่นจบด่าน
    $stmt_progress = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, attempts, completed_at)
                                     VALUES (?, ?, ?, 1, ?)
                                     ON DUPLICATE KEY UPDATE
                                     score = VALUES(score),         -- บันทึกคะแนนดาวสูงสุด
                                     attempts = attempts + 1,       -- เพิ่มจำนวนครั้งที่เล่น
                                     completed_at = VALUES(completed_at)"); // อัปเดตเวลาล่าสุดที่เล่นจบ

    // 'iiis' คือประเภทของพารามิเตอร์: user_id (int), stage_id (int), new_score_to_save (int), completed_at (string)
    $stmt_progress->bind_param("iiis", $user_id, $stage_id, $new_score_to_save, $completed_at);
    $stmt_progress->execute();
    $stmt_progress->close();

    // 4. บันทึกข้อมูลในตาราง 'game_logs' (เพื่อเก็บบันทึกการเล่นแต่ละครั้งอย่างละเอียด)
    //    action จะระบุสถานะการจบด่านพร้อมจำนวนดาวที่ได้
    $stmt_log = $conn->prepare("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)");
    $stmt_log->bind_param("iiss", $user_id, $stage_id, $action_log, $detail_json);
    $stmt_log->execute();
    $stmt_log->close();

    // ส่งสถานะกลับไปให้ Frontend ทราบ
    echo json_encode(['status' => 'ok', 'stars_saved' => $new_score_to_save]);
    exit;
}

// หากไม่ใช่ POST request หรือไม่มี user_id ใน session
echo json_encode(['status' => 'error', 'message' => 'Invalid request or not logged in.']);
exit;