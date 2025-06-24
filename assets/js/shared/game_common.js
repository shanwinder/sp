// แสดงปุ่มไปด่านถัดไปพร้อมแถบความคืบหน้าแบบถอยหลัง
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

// แอนิเมชันเมื่อคะแนนรวมเปลี่ยน
window.animateScoreChange = function (score) {
  const scoreEl = document.getElementById('total-score');
  if (!scoreEl) return;
  scoreEl.textContent = score;
  scoreEl.classList.add('score-animate');
  setTimeout(() => {
    scoreEl.classList.remove('score-animate');
  }, 600);
};
