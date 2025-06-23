<?php
// ตรวจสอบว่ามี session หรือยัง
if (!isset($_SESSION))
    session_start();

// กำหนดค่าเริ่มต้น fallback ถ้าไม่ได้ส่งค่าเข้ามา
$game_title = $game_title ?? 'ไม่ระบุเกม';
$stage_id = $stage_id ?? '-';
$next_stage_link = $next_stage_link ?? '#';
?>

<div id="top-bar">
    <div>
        👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?? 'ไม่ระบุ' ?></strong> |
        🧩 เกม: <strong><?= $game_title ?></strong> |
        🧠 ด่านที่: <strong><?= $stage_id ?></strong> |
        🌟 คะแนนรวม: <strong id="total-score">--</strong>
    </div>
    <div>
        <a href="student_dashboard.php" class="btn btn-primary btn-sm">กลับแดชบอร์ด</a>
        <a href="<?= $next_stage_link ?>" id="nextStageBtn" class="btn btn-success btn-sm"
            style="display: none; position: relative;">
            <span class="btn-label" style="position: relative; z-index: 2;">
                ▶️ ไปด่านถัดไป (<span id="seconds">10</span>)
            </span>

            <div class="btn-progress" id="progress-overlay" style="
                position: absolute;
                top: 0; left: 0; height: 100%;
                width: 100%; background-color: rgba(255, 255, 255, 0.25);
                z-index: 1; transition: width 1s linear; border-radius: 8px;">
            </div>
        </a>

    </div>
</div>