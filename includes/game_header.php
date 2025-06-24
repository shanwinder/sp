<?php
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

<script>
document.addEventListener('DOMContentLoaded', () => {
  updateScoreBar(); // เรียกเมื่อโหลดหน้า

  window.updateScoreBar = function () {
    const scoreEl = document.getElementById('total-score');
    const current = parseInt(scoreEl.textContent) || 0;

    fetch('../api/get_total_score.php')
      .then(res => res.json())
      .then(data => {
        const target = data.score ?? 0;
        animateScoreChange(current, target);
      });
  };

  window.animateScoreChange = function (current, target) {
    const scoreEl = document.getElementById('total-score');
    const step = 5;
    const delay = 30;
    let value = current;

    if (value >= target) {
      scoreEl.textContent = target;
      return;
    }

    const interval = setInterval(() => {
      value += step;
      if (value >= target) {
        value = target;
        clearInterval(interval);
      }
      scoreEl.textContent = value;
      scoreEl.classList.add('score-animate');
      setTimeout(() => {
        scoreEl.classList.remove('score-animate');
      }, 200);
    }, delay);
  };

  // ปุ่ม "ไปด่านถัดไป" พร้อมแถบนับถอยหลัง
  window.triggerAutoNextStage = function () {
    const nextBtn = document.getElementById("nextStageBtn");
    const secondsSpan = document.getElementById("seconds");
    const overlay = document.getElementById("next-progress-fill");

    if (!nextBtn || !secondsSpan || !overlay) return;

    nextBtn.style.display = 'inline-block';
    let count = 10;
    secondsSpan.textContent = count;

    overlay.style.transition = 'width 10s linear';
    overlay.style.width = '100%';

    setTimeout(() => {
      overlay.style.width = '0%';
    }, 50);

    const timer = setInterval(() => {
      count--;
      secondsSpan.textContent = count;
      if (count <= 0) {
        clearInterval(timer);
        window.location.href = nextBtn.href;
      }
    }, 1000);
  };
});
</script>
