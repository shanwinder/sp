// File: assets/js/logic_game/stage3.js (ฉบับแก้ไขโครงสร้างสมบูรณ์)

document.addEventListener('DOMContentLoaded', () => {
    const problemContainer = document.getElementById('problem-container');
    const winOverlay = document.getElementById('win-overlay');

    const problems = [
        { sequence: [1, 2, null, 4], answer: 3 },
        { sequence: [2, 4, null, 8], answer: 6 },
        { sequence: [5, 10, null, 20], answer: 15 },
        { sequence: [1, 3, null, 7], answer: 5 },
        { sequence: [10, 8, null, 4], answer: 6 }
    ];

    let current = 0;
    let stageCompleted = false;

    // ✅✅✅ สร้าง Object กลางสำหรับฟังก์ชันของเกม ✅✅✅
    // เพื่อให้ HTML onclick สามารถเรียกใช้ได้อย่างถูกต้องเสมอ
    window.gameLogic = {
        checkAnswer: function () {
            const input = document.getElementById('ans');
            if (!input) return;

            const val = parseInt(input.value);
            if (!isNaN(val) && val === problems[current].answer) {
                current++;
                if (current >= problems.length) {
                    this.showWinAnimation();
                } else {
                    this.showPopup("🎉 ถูกต้อง! ไปข้อต่อไป");
                    setTimeout(this.showProblem, 1500);
                }
            } else {
                this.showPopup("❌ ผิด ลองอีกครั้ง");
                input.focus();
                input.select();
            }
        },

        showProblem: function () {
            if (stageCompleted) return;
            const p = problems[current];
            problemContainer.innerHTML = `
            <div class="game-box text-center">
                <h3 style="font-size: 1.8rem;">เติมตัวเลขที่หายไป (ข้อที่ ${current + 1}/${problems.length})</h3>
                <div class="d-flex justify-content-center align-items-center gap-3 py-3" style="font-size: 2rem;">
                ${p.sequence.map(n => n === null ? '<input id="ans" type="number" class="form-control d-inline text-center" style="width:100px; font-size:1.8rem;" autofocus />' : `<span>${n}</span>`).join('<span>,</span>')}
                </div>
                <button onclick="window.gameLogic.checkAnswer()" class="btn btn-success mt-2" style="font-size: 1.2rem;">ตรวจคำตอบ</button>
            </div>
            `;

            const answerInput = document.getElementById('ans');
            if (answerInput) {
                answerInput.focus();
                answerInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        window.gameLogic.checkAnswer();
                    }
                });
            }
        },

        showPopup: function (msg) {
            const tempPopup = document.createElement('div');
            tempPopup.id = 'temp-feedback-popup';
            tempPopup.style.position = 'fixed';
            tempPopup.style.top = '20%';
            tempPopup.style.left = '50%';
            tempPopup.style.transform = 'translate(-50%, -50%)';
            tempPopup.style.background = '#2c3e50';
            tempPopup.style.color = 'white';
            tempPopup.style.padding = '15px 25px';
            tempPopup.style.borderRadius = '12px';
            tempPopup.style.fontSize = '24px';
            tempPopup.style.zIndex = '3000';
            tempPopup.innerHTML = msg;
            document.body.appendChild(tempPopup);
            setTimeout(() => { tempPopup.remove(); }, 1500);
        },

        showWinAnimation: function () {
            if (stageCompleted) return;
            stageCompleted = true;

            problemContainer.style.display = 'none';
            winOverlay.classList.add('visible');

            setTimeout(() => {
                this.sendResult(100);
            }, 500);
        },

        sendResult: function (score) {
            fetch('../api/submit_stage_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `stage_id=${STAGE_ID}&score=${score}`
            }).then(() => {
                if (typeof window.updateScoreBar === 'function') {
                    window.updateScoreBar();
                }
                if (typeof window.triggerAutoNextStage === 'function') {
                    window.triggerAutoNextStage();
                }
            });
        }
    };

    // เริ่มเกมครั้งแรก
    window.gameLogic.showProblem();
});