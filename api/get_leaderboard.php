<?php
// File: api/get_leaderboard.php
// API สำหรับดึงข้อมูล Leaderboard แบบเรียลไทม์

session_start();
require_once '../includes/db.php'; // เรียกไฟล์เชื่อมต่อฐานข้อมูล

// กำหนดจำนวนผู้เล่นสูงสุดที่จะแสดงใน Leaderboard (สามารถปรับได้)
$limit = 10; // แสดง 10 อันดับแรก

// คำสั่ง SQL สำหรับดึงคะแนนรวมของนักเรียนทุกคนพร้อมชื่อและจัดอันดับ
// ใช้ LEFT JOIN เพื่อให้แสดงชื่อนักเรียนทุกคน แม้จะยังไม่มีคะแนนในตาราง progress
$sql = "
    SELECT
        u.name,
        COALESCE(SUM(p.score), 0) AS total_stars,
        RANK() OVER (ORDER BY COALESCE(SUM(p.score), 0) DESC) as rank_num
    FROM
        users AS u
    LEFT JOIN
        progress AS p ON u.id = p.user_id
    WHERE
        u.role = 'student' -- เฉพาะนักเรียนเท่านั้น
    GROUP BY
        u.id, u.name
    ORDER BY
        total_stars DESC, u.name ASC -- จัดเรียงตามคะแนนรวม (มากไปน้อย), ชื่อ (A-Z) เพื่อจัดลำดับ
    LIMIT ?; -- จำกัดจำนวนผลลัพธ์
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $limit); // 'i' สำหรับ integer (limit)
$stmt->execute();
$result = $stmt->get_result();

$leaderboard_data = [];
while ($row = $result->fetch_assoc()) {
    $leaderboard_data[] = [
        'rank' => $row['rank_num'],
        'name' => htmlspecialchars($row['name']),
        'total_stars' => (int)$row['total_stars']
    ];
}
$stmt->close();

// ส่งข้อมูลกลับไปในรูปแบบ JSON
header('Content-Type: application/json');
echo json_encode($leaderboard_data);
exit;
?>