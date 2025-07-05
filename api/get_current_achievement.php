<?php
// File: api/get_current_achievement.php
// ใช้สำหรับดึงคะแนนดาวรวมทั้งหมดของนักเรียน, ฉายาสูงสุดที่ได้รับ, และ class CSS ของฉายานั้น

// เริ่ม session หากยังไม่ได้เริ่ม
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เรียกไฟล์เชื่อมต่อฐานข้อมูล
require_once '../includes/db.php';

/**
 * ฟังก์ชันสำหรับดึงคะแนนดาวรวมทั้งหมดของนักเรียน, ฉายาสูงสุดที่ได้รับ, และ class CSS ของฉายานั้น
 * @param int $user_id ID ของนักเรียน
 * @param mysqli $conn Object การเชื่อมต่อฐานข้อมูล
 * @return array ข้อมูลคะแนนดาวรวม, ชื่อฉายาปัจจุบัน, และ class CSS ของฉายา
 */
function getCurrentAchievement($user_id, $conn)
{
    // 1. ดึงคะแนนดาวรวมทั้งหมดของนักเรียนจากตาราง 'progress'
    $sql_total_stars = "SELECT SUM(score) as total_stars FROM progress WHERE user_id = ?";
    $stmt_total_stars = $conn->prepare($sql_total_stars);
    $stmt_total_stars->bind_param("i", $user_id);
    $stmt_total_stars->execute();
    $result_total_stars = $stmt_total_stars->get_result();
    $total_stars_data = $result_total_stars->fetch_assoc();
    $total_stars = $total_stars_data['total_stars'] ?: 0;
    $stmt_total_stars->close();

    // 2. ดึงฉายาสูงสุดที่นักเรียนได้รับ พร้อมกับ `css_class` จากตาราง 'titles'
    // ✅ เพิ่ม `css_class` ใน SELECT query
    $sql_achievement = "SELECT title_name, css_class FROM titles WHERE min_stars_required <= ? ORDER BY min_stars_required DESC LIMIT 1";
    $stmt_achievement = $conn->prepare($sql_achievement);
    $stmt_achievement->bind_param("i", $total_stars);
    $stmt_achievement->execute();
    $result_achievement = $stmt_achievement->get_result();
    $achievement_data = $result_achievement->fetch_assoc();
    $stmt_achievement->close();

    return [
        'total_stars' => $total_stars,
        'current_title' => $achievement_data ? $achievement_data['title_name'] : 'นักเรียนเริ่มต้น',
        'current_title_class' => $achievement_data ? $achievement_data['css_class'] : '' // ✅ ส่ง class CSS กลับไปด้วย
    ];
}

// ตรวจสอบว่าเป็น GET request และมี user_id ใน session ก่อนประมวลผล
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_SESSION['user_id'])) {
    $achievement_info = getCurrentAchievement($_SESSION['user_id'], $conn);
    echo json_encode($achievement_info);
    exit;
}

// หากไม่ใช่ GET request หรือไม่มี user_id ใน session
echo json_encode(['status' => 'error', 'message' => 'Invalid request or not logged in.']);
exit;