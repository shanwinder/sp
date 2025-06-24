// File: assets/js/logic_game/stage3.js

// ลบ: window.addEventListener('DOMContentLoaded', ...) ที่โหลดคะแนนเริ่มต้น เพราะ game_common.js จัดการให้
// ลบ: fetch('../api/get_total_score.php')... ด้านล่าง เพราะ game_common.js จัดการให้

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');

    const problems = [
        { sequence: [1, 2, null, 4], answer: 3 }, // ง่าย
        { sequence: [2, 4, null, 8], answer: 6 }, // คูณด้วย 2
        { sequence: [5, 10, null, 20], answer: 15 }, // บวก 5
        { sequence: [1, 3, null, 7], answer: 5 }, // บวกทีละ 2
        { sequence: [10, 8, null, 4], answer: 6 } // ลบทีละ 2
    ];

    let current = 0;

    const showProblem = () => {
        const p = problems[current];
        container.innerHTML = `
        <div class="game-box text-center p-4">
            <h3 style="font-size: 1.8rem;">เติมตัวเลขที่หายไป</h3>
            <p style="font-size: 2rem;">
            ${p.sequence.map(n => n === null ? '<input id="ans" class="form-control d-inline" style="width:90px; display:inline; font-size:1.8rem;" />' : n).join(' , ')}
            </p>
            <button class="btn btn-success mt-3" onclick="checkAnswer()" style="font-size: 1.2rem;">ตรวจคำตอบ</button>
        </div>
        `;
    };

    window.checkAnswer = () => {
        const input = document.getElementById('ans');
        const val = parseInt(input.value);
        if (val === problems[current].answer) {
            current++;
            if (current >= problems.length) {
                showPopup("✅ คุณผ่านด่านแล้ว!");
                sendResult(100);
                return;
            }
            showPopup("🎉 ถูกต้อง! ไปข้อต่อไป");
            setTimeout(() => {
                hidePopup();
                showProblem();
            }, 1500);
        } else {
            showPopup("❌ ผิด ลองอีกครั้ง");
        }
    };

    function showPopup(msg) {
        const popup = document.getElementById('feedback-popup');
        popup.innerHTML = msg;
        popup.style.display = 'block';
    }

    function hidePopup() {
        const popup = document.getElementById('feedback-popup');
        popup.style.display = 'none';
    }

    function sendResult(score) {
        // อัปเดต URL ไปยัง submit_stage_score.php
        return fetch('../api/submit_stage_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `stage_id=${STAGE_ID}&score=${score}`
        }).then(() => {
            // เรียก updateScoreBar ที่รวมศูนย์ใน game_common.js
            if (typeof window.updateScoreBar === 'function') {
                window.updateScoreBar();
            }
        }).then(() => {
            setTimeout(() => {
                // เรียก triggerAutoNextStage ที่รวมศูนย์ใน game_common.js
                if (window.triggerAutoNextStage) {
                    window.triggerAutoNextStage();
                }
            }, 300);
        });
    }

    showProblem();
});