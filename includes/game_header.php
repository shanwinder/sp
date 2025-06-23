<?php
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
  header("Location: ../pages/login.php");
  exit();
}
?>
<div id="top-bar">
  <div>
    👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?></strong> |
    🧩 เกม: <strong><?= $game_title ?? 'ไม่ระบุเกม' ?></strong> |
    🧠 ด่านที่: <strong><?= $stage_id ?></strong> |
    🌟 คะแนนรวม: <strong id="total-score">--</strong>
  </div>
  <div>
    <a href="student_dashboard.php" class="btn btn-primary btn-sm">กลับแดชบอร์ด</a>


  </div>
  <div class="text-center">
    <a href="stage_logic_3.php" id="nextStageBtn" class="btn btn-success btn-sm" style="display:none;">
      ไปด่านถัดไป ▶️</a>
    <span id="countdown">(กำลังไปใน <span id="seconds">10</span> วินาที...)</span>
  </div>
</div>