// File: assets/js/logic_game/stage3.js
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');

    const problems = [
        { sequence: [1, 2, null, 4], answer: 3 },
        { sequence: [2, 4, null, 8], answer: 6 },
        { sequence: [5, 10, null, 20], answer: 15 },
        { sequence: [1, 3, null, 7], answer: 5 },
        { sequence: [10, 8, null, 4], answer: 6 }
    ];
    let current = 0;
    let stageCompleted = false; // ป้องกันการส่งข้อมูลซ้ำ

    const showProblem = () => {
        if (current >= problems.length) return;
        const p = problems[current];
        container.innerHTML = `
        <div class="game-box text-center p-4">
            <h3 style="font-size: 1.8rem;">เติมตัวเลขที่หายไป (ข้อที่ ${current + 1}/${problems.length})</h3>
            <div style="font-size: 2rem; display: flex; justify-content: center; align-items: center; gap: 10px;">
            ${p.sequence.map(n => n === null ? '<input id="ans" type="number" class="form-control d-inline text-center" style="width:100px; font-size:1.8rem;" autofocus />' : `<span>${n}</span>`).join('<span>,</span>')}
            </div>
            <button class="btn btn-success mt-3" onclick="checkAnswer()" style="font-size: 1.2rem;">ตรวจคำตอบ</button>
        </div>
        `;
        document.getElementById('ans').focus();
    };

    window.checkAnswer = () => {
        const input = document.getElementById('ans');
        const val = parseInt(input.value);

        if (!isNaN(val) && val === problems[current].answer) {
            current++;
            if (current >= problems.length) {
                showPopup("✅ คุณผ่านด่านแล้ว!");
                sendResult(100); // ส่งผลเมื่อผ่านด่าน
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
        setTimeout(hidePopup, 2000);
    }

    function hidePopup() {
        const popup = document.getElementById('feedback-popup');
        popup.style.display = 'none';
    }

    function sendResult(score) {
        if (stageCompleted) return; // ถ้าเคยส่งแล้ว ไม่ต้องส่งซ้ำ
        stageCompleted = true;

        fetch('../api/submit_stage_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `stage_id=${STAGE_ID}&score=${score}`
        }).then(() => {
            if (typeof window.updateScoreBar === 'function') {
                window.updateScoreBar();
            }
        }).then(() => {
            setTimeout(() => {
                if (window.triggerAutoNextStage) {
                    window.triggerAutoNextStage();
                }
            }, 300);
        }).catch(error => {
            console.error('Error sending score:', error);
            stageCompleted = false; // หากเกิดข้อผิดพลาด ให้ลองส่งใหม่ได้
        });
    }

    showProblem();
});