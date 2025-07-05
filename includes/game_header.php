<?php
// File: includes/game_header.php (ฉบับปรับปรุงสำหรับแสดงฉายา)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// ตรวจสอบการล็อกอิน (สามารถเปิดใช้งานได้ในภายหลัง)
// if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
//     header("Location: ../pages/login.php");
//     exit();
// }
?>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;700&display=swap" rel="stylesheet">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/game_header.css">

<div id="top-bar">
    <div class="info-text">
        👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?? 'ทดสอบ' ?></strong> |
        🧩 เกม: <strong><?= $game_title ?? 'ไม่ระบุเกม' ?></strong> |
        🧠 ด่านที่: <strong><?= $stage_id ?? 'N/A' ?></strong> |
        🌟 ดาวรวม: <strong id="total-score">0</strong> |
        ✨ ฉายา: <strong id="current-achievement-game-header">นักเรียนเริ่มต้น</strong> 
    </div>

    <div class="top-bar-buttons">
        <a href="student_dashboard.php" class="btn-dashboard">🏠 กลับแดชบอร์ด</a>
        <a href="<?= $next_stage_link ?? '#' ?>" id="nextStageBtn" class="btn-next-stage">
            <div class="progress-bar-inner" id="next-progress-fill"></div>
            <span class="btn-text">▶️ ไปด่านถัดไป (<span id="seconds">10</span>)</span>
        </a>
    </div>
</div>