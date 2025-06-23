<?php
// ไฟล์ game_header.php
// (ไม่มีโค้ด PHP ในส่วนนี้อีกแล้ว นอกจากการแสดงผลตัวแปร)

// ตรวจสอบการเข้าสู่ระบบถูกย้ายไปที่ stage_logic_1.php แล้ว
// และ style="display:none;" จะยังคงอยู่ที่นี่ เพื่อให้ JS ควบคุม
?>
<div id="top-bar">
  <div class="top-bar-left">
    👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?></strong> |
    🧩 เกม: <strong><?= $game_title ?? 'ไม่ระบุเกม' ?></strong> |
    🧠 ด่านที่: <strong><?= $stage_id ?></strong> |
    🌟 คะแนนรวม: <strong id="total-score">--</strong>
  </div>
  <div class="top-bar-right">
    <a href="student_dashboard.php" class="btn btn-primary btn-sm me-2 custom-dashboard-btn">กลับแดชบอร์ด</a>

    <a href="<?= $next_stage_link ?? '#' ?>" id="nextStageBtn"
      class="btn btn-success btn-sm btn-next-stage custom-dashboard-btn" style="display:none;">
      <span class="btn-label">▶️ ไปด่านถัดไป (<span id="seconds">10</span>)</span>
      <div class="btn-progress" id="progress-overlay"></div>
    </a>
  </div>
</div>