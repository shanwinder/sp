// File: assets/js/shared/game_common.js

// ฟังก์ชันสำหรับแอนิเมชันเมื่อคะแนนรวมเปลี่ยน (เพิ่มทีละ 5)
window.animateScoreChange = function (current, target) {
    const scoreEl = document.getElementById('total-score');
    if (!scoreEl) return;

    const step = 5; // กำหนดให้เพิ่มทีละ 5
    const delay = 30; // ความหน่วง 30ms

    // ถ้าคะแนนปัจจุบันมากกว่าหรือเท่ากับเป้าหมาย ไม่ต้องทำแอนิเมชัน
    if (current >= target) {
        scoreEl.textContent = target;
        scoreEl.classList.add('score-animate');
        setTimeout(() => {
            scoreEl.classList.remove('score-animate');
        }, 600); // ระยะเวลาแอนิเมชัน pop-score ใน CSS
        return;
    }

    let value = current;
    const interval = setInterval(() => {
        value += step;
        if (value >= target) {
            value = target;
            clearInterval(interval);
        }
        scoreEl.textContent = value;
        // Trigger CSS animation
        scoreEl.classList.add('score-animate');
        setTimeout(() => {
            scoreEl.classList.remove('score-animate');
        }, 200); // ระยะเวลาที่ค้าง class ไว้สั้นๆ เพื่อให้แอนิเมชันทำงานแต่ละ step
    }, delay);
};

// ฟังก์ชันสำหรับอัปเดต Score Bar โดยเรียก animateScoreChange
window.updateScoreBar = function () {
    const scoreEl = document.getElementById('total-score');
    const current = parseInt(scoreEl.textContent) || 0; // คะแนนปัจจุบันก่อน fetch

    fetch('../api/get_total_score.php')
        .then(res => res.json())
        .then(data => {
            const target = data.score ?? 0;
            animateScoreChange(current, target);
        });
};

// ฟังก์ชันสำหรับแสดงปุ่มไปด่านถัดไปพร้อมแถบความคืบหน้าแบบถอยหลัง
window.triggerAutoNextStage = function () {
    const nextBtn = document.getElementById("nextStageBtn");
    const secondsSpan = document.getElementById("seconds");
    const overlay = document.getElementById("next-progress-fill");

    if (!nextBtn || !secondsSpan || !overlay) return;

    nextBtn.style.display = 'inline-block';
    let count = 10;
    secondsSpan.textContent = count;

    // Reset progress bar for animation
    overlay.style.transition = 'none'; // Clear previous transition
    overlay.style.width = '0%';
    // Force reflow
    void overlay.offsetWidth; 

    // Start new transition
    overlay.style.transition = 'width 10s linear';
    overlay.style.width = '100%';

    const timer = setInterval(() => {
        count--;
        secondsSpan.textContent = count;
        if (count <= 0) {
            clearInterval(timer);
            window.location.href = nextBtn.href;
        }
    }, 1000);
};

// เรียก updateScoreBar เมื่อ DOM โหลดเสร็จ เพื่อแสดงคะแนนเริ่มต้นพร้อมแอนิเมชัน
document.addEventListener('DOMContentLoaded', () => {
    updateScoreBar();
});