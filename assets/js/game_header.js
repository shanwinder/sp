document.addEventListener('DOMContentLoaded', () => {
  const scoreEl = document.getElementById('total-score');
  if (!scoreEl) return;

  // ถ้ามีคะแนนปัจจุบันอยู่แล้ว ให้ใช้เป็นฐาน
  const initialRaw = scoreEl.textContent.replace(/[^\d]/g, '');
  const initial = parseInt(initialRaw, 10);
  const baseScore = isNaN(initial) ? 0 : initial;
  scoreEl.textContent = baseScore;

  // ดึงคะแนนล่าสุดจากเซิร์ฟเวอร์
  fetch('../api/get_total_score.php')
    .then(res => res.json())
    .then(data => {
      if (data.score !== undefined) {
        animateScoreChange(baseScore, data.score);
      }
    });
});

// แสดงแอนิเมชันเพิ่มทีละ 5 อย่างลื่นไหล
function animateScoreChange(current, target) {
  const scoreEl = document.getElementById('total-score');
  if (!scoreEl) return;

  const step = 5;
  const delay = 40;
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
}

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
