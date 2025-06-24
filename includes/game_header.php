<?php
// File: includes/game_header.php
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    header("Location: ../pages/login.php");
    exit();
}
?>

<link rel="stylesheet" href="../assets/css/game_header.css">

<div id="top-bar">
    <div class="info-text">
        👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?></strong> |
        🧩 เกม: <strong><?= $game_title ?? 'ไม่ระบุเกม' ?></strong> |
        🧠 ด่านที่: <strong><?= $stage_id ?></strong> |
        🌟 คะแนนรวม: <strong id="total-score">0</strong>
    </div>

    <div class="top-bar-buttons">
        <a href="student_dashboard.php" class="btn-dashboard">🏠 กลับแดชบอร์ด</a>
        <a href="<?= $next_stage_link ?>" id="nextStageBtn" class="btn-next-stage">
            <div class="progress-bar-inner" id="next-progress-fill"></div>
            <span class="btn-text">▶️ ไปด่านถัดไป (<span id="seconds">10</span>)</span>
        </a>
    </div>
</div>