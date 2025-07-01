// File: assets/js/logic_game/stage3.js (ฉบับแก้ไขสมบูรณ์และสวยงาม)

(function () {
    // ฟังก์ชันนี้จะทำงานเมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
    document.addEventListener('DOMContentLoaded', function () {
        
        // --- 1. การตั้งค่าพื้นฐานของเกม (Phaser Config) ---
        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 700,
                height: 200 // ลดความสูงลง เพราะเราจะแสดงแค่โจทย์ใน canvas
            },
            parent: "game-container",
            backgroundColor: '#ffffff', // ทำให้พื้นหลังโปร่งใสเพื่อให้เข้ากับหน้าเว็บ
            scene: {
                preload: preload,
                create: create
            }
        };

        // --- 2. ข้อมูลโจทย์และตัวแปรของเกม ---
        const problems = [
            { sequence: [1, 2, '?', 4], answer: 3 },
            { sequence: [2, 4, '?', 8], answer: 6 },
            { sequence: [5, 10, '?', 20], answer: 15 },
            { sequence: [10, 8, '?', 4], answer: 6 },
            { sequence: [3, 6, 9, '?'], answer: 12 }
        ];

        let currentProblemIndex = 0; // ตัวแปรเก็บดัชนีของโจทย์ข้อปัจจุบัน
        let gameScene; // ตัวแปรสำหรับเก็บ scene ของเกม เพื่อให้เรียกใช้ได้จากทุกที่
        let problemTextObjects = []; // массив для хранения текстовых объектов текущей задачи
        const game = new Phaser.Game(config); // สร้างเกม

        // --- 3. ดึงองค์ประกอบ HTML มาเก็บในตัวแปร ---
        const answerInput = document.getElementById('answer-input');
        const checkButton = document.getElementById('check-button');
        const feedbackText = document.getElementById('feedback-text');

        // --- 4. ฟังก์ชันของ Phaser ---
        function preload() {
            // โหลดเสียงที่จำเป็น
            this.load.audio('correct_sound', '../assets/sound/correct.mp3');
            this.load.audio('wrong_sound', '../assets/sound/wrong.mp3');
        }

        function create() {
            gameScene = this; // กำหนดค่า scene ปัจจุบัน
            // แสดงโจทย์ข้อแรก
            displayCurrentProblem();
        }

        // --- 5. ฟังก์ชันควบคุมตรรกะของเกม ---
        
        // ฟังก์ชันแสดงโจทย์ปัจจุบันใน canvas
        function displayCurrentProblem() {
            // ล้างโจทย์เก่าออกก่อน
            problemTextObjects.forEach(text => text.destroy());
            problemTextObjects = [];

            const problem = problems[currentProblemIndex];
            const yPos = config.scale.height / 2; // จัดให้อยู่กึ่งกลางแนวตั้ง
            const spacing = config.scale.width / (problem.sequence.length + 1); //คำนวณระยะห่างอัตโนมัติ

            // วนลูปเพื่อสร้างตัวเลขแต่ละตัวในโจทย์
            problem.sequence.forEach((item, index) => {
                const text = gameScene.add.text(spacing * (index + 1), yPos, item, {
                    fontSize: '64px', // ตัวเลขใหญ่ๆ
                    color: item === '?' ? '#ff6f61' : '#0d6efd', // ทำให้เครื่องหมาย '?' มีสีเด่น
                    fontFamily: 'Kanit, sans-serif',
                    fontWeight: 'bold',
                    stroke: '#ffffff',
                    strokeThickness: 6
                }).setOrigin(0.5);

                problemTextObjects.push(text);
            });
        }

        // ฟังก์ชันตรวจคำตอบ
        function handleCheckAnswer() {
            if (answerInput.value === '') return; // ไม่ทำอะไรถ้าช่องว่าง

            const userAnswer = parseInt(answerInput.value, 10);
            const correctAnswer = problems[currentProblemIndex].answer;

            if (userAnswer === correctAnswer) {
                // กรณีตอบถูก
                gameScene.sound.play('correct_sound');
                feedbackText.textContent = '🎉 ถูกต้องครับ เก่งมาก!';
                feedbackText.className = 'mt-3 text-success';
                
                currentProblemIndex++; // เลื่อนไปโจทย์ข้อถัดไป

                if (currentProblemIndex >= problems.length) {
                    // ถ้าทำครบทุกข้อแล้ว -> ชนะ
                    setTimeout(handleWin, 1000);
                } else {
                    // ถ้ายังไม่ครบ -> แสดงโจทย์ข้อถัดไป
                    setTimeout(() => {
                        displayCurrentProblem();
                        feedbackText.textContent = ''; // ล้างข้อความ feedback
                    }, 1500);
                }
            } else {
                // กรณีตอบผิด
                gameScene.sound.play('wrong_sound');
                feedbackText.textContent = '❌ ยังไม่ถูกนะ ลองคิดดูอีกที!';
                feedbackText.className = 'mt-3 text-danger';
                gameScene.cameras.main.shake(150, 0.005); // เขย่าหน้าจอเบาๆ
            }

            answerInput.value = ''; // ล้างช่องกรอกข้อมูล
            answerInput.focus(); // ให้เคอร์เซอร์กลับไปที่ช่องกรอก
        }

        // ฟังก์ชันเมื่อผู้เล่นผ่านด่าน
        function handleWin() {
            // ซ่อนพื้นที่เกมและแสดงข้อความว่า "ชนะแล้ว"
            document.getElementById('game-area').innerHTML = `
                <div class="text-center">
                    <h2 class="text-success" style="font-size: 3rem;">✨ ยอดเยี่ยม! ✨</h2>
                    <p class="lead" style="font-size: 1.5rem;">คุณผ่านด่านลำดับตัวเลขแล้ว<br>ได้รับ +100 คะแนน</p>
                </div>
            `;
            // ส่งคะแนนไปที่ server
            sendResult(100);
        }

        // ฟังก์ชันส่งคะแนน
        function sendResult(score) {
            fetch('../api/submit_stage_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `stage_id=${STAGE_ID}&score=${score}`
            }).then(() => {
                if (typeof window.updateScoreBar === 'function') window.updateScoreBar();
                if (typeof window.triggerAutoNextStage === 'function') window.triggerAutoNextStage();
            });
        }

        // --- 6. การเชื่อมต่อเหตุการณ์ (Event Listeners) ---
        checkButton.addEventListener('click', handleCheckAnswer);
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleCheckAnswer();
            }
        });

        // ให้เคอร์เซอร์ไปรอที่ช่องกรอกข้อมูลเมื่อหน้าเว็บพร้อม
        answerInput.focus();
    });
})();