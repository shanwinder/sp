// File: assets/js/logic_game/stage3_phaser_themed.js (สร้างไฟล์ใหม่)

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        
        // --- การตั้งค่าพื้นฐานของเกม Phaser ---
        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 900, // ขนาดเท่าด่าน 1
                height: 600,
            },
            parent: "game-container", // แสดงผลใน div#game-container
            dom: {
                createContainer: true // เปิดใช้งานการสร้าง DOM Element บน Canvas
            },
            scene: {
                preload: preload,
                create: create,
            }
        };
        
        // --- ข้อมูลโจทย์และคำตอบ (จากเกมเดิม) ---
        const problems = [
            { sequence: [1, 2, '?', 4], answer: 3 },
            { sequence: [2, 4, '?', 8], answer: 6 },
            { sequence: [5, 10, '?', 20], answer: 15 },
            { sequence: [10, 8, '?', 4], answer: 6 },
            { sequence: [3, 6, 9, '?', 15], answer: 12 }
        ];
        let currentProblemIndex = 0;
        let stageCompleted = false;

        // --- ฟังก์ชัน Preload: โหลดเสียง ---
        function preload() {
            this.load.audio('correct', '../assets/sound/correct.mp3');
            this.load.audio('wrong', '../assets/sound/wrong.mp3');
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            const scene = this;
            scene.problemElements = []; // Array สำหรับเก็บ Element ของโจทย์แต่ละข้อ
            
            // --- สร้าง UI พื้นฐานให้เหมือนด่าน 1 ---
            const graphics = scene.add.graphics();
            // พื้นหลังไล่สี
            graphics.fillGradientStyle(0xfef3c7, 0xfef3c7, 0xbae6fd, 0xbae6fd, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            // กรอบพื้นหลังของเกม
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 550, 20);
            
            // --- ฟังก์ชันสำหรับแสดงโจทย์ ---
            function renderProblem() {
                if (stageCompleted) return;
                
                // ล้างโจทย์เก่าออกก่อน
                scene.problemElements.forEach(el => el.destroy());
                scene.problemElements = [];
                
                const problem = problems[currentProblemIndex];
                const spacing = 180; // ระยะห่าง
                const startX = (config.scale.width - (problem.sequence.length - 1) * spacing) / 2;
                
                // --- แสดงหัวข้อ ---
                const title = scene.add.text(config.scale.width / 2, 80, `โจทย์ข้อที่ ${currentProblemIndex + 1} / ${problems.length}`, { fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                scene.problemElements.push(title);

                // --- วนลูปสร้างตัวเลขและช่องว่าง ---
                problem.sequence.forEach((item, i) => {
                    const x = startX + i * spacing;
                    const y = 250;

                    if (item === '?') {
                        // ถ้าเจอ '?' ให้สร้างช่อง Input โดยใช้ DOM Element
                        const inputElement = scene.add.dom(x, y).createFromCache('answer-input-dom');
                        scene.problemElements.push(inputElement);
                        
                        // ทำให้กด Enter ในช่อง Input ได้
                        inputElement.addListener('keydown');
                        inputElement.on('keydown', function (event) {
                            if (event.key === 'Enter') {
                                checkAnswer();
                            }
                        });
                        // Focus ที่ช่อง Input อัตโนมัติ
                        // ใช้ a small delay to ensure the element is ready
                        setTimeout(() => inputElement.node.focus(), 100);

                    } else {
                        // แสดงตัวเลข
                        const numberText = scene.add.text(x, y, item, { fontSize: '80px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                        scene.problemElements.push(numberText);
                    }

                    // เพิ่มเครื่องหมายจุลภาค (,) ถ้าไม่ใช่ตัวสุดท้าย
                    if (i < problem.sequence.length - 1) {
                       const comma = scene.add.text(x + spacing / 2, y, ',', { fontSize: '80px', color: '#6b7280', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                       scene.problemElements.push(comma);
                    }
                });

                // --- สร้างปุ่มตรวจคำตอบ ---
                const checkButton = scene.add.text(config.scale.width / 2, 450, '✔️ ตรวจคำตอบ', { 
                    fontSize: '28px', 
                    color: '#ffffff', 
                    backgroundColor: '#16a34a',
                    padding: { x: 30, y: 15 },
                    borderRadius: 10
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                checkButton.on('pointerdown', checkAnswer);
                scene.problemElements.push(checkButton);
            }

            // --- ฟังก์ชันสำหรับตรวจคำตอบ ---
            function checkAnswer() {
                const inputField = scene.children.list.find(child => child.type === 'DOMElement');
                if (!inputField || !inputField.node) return;

                const userAnswer = parseInt(inputField.node.value);
                const correctAnswer = problems[currentProblemIndex].answer;

                if (!isNaN(userAnswer) && userAnswer === correctAnswer) {
                    scene.sound.play('correct');
                    currentProblemIndex++;
                    if (currentProblemIndex >= problems.length) {
                        stageCompleted = true;
                        showWinAnimation(scene);
                    } else {
                        renderProblem();
                    }
                } else {
                    scene.sound.play('wrong');
                    scene.cameras.main.shake(200, 0.01); // สั่นจอเมื่อตอบผิด
                }
            }
            
            // --- เริ่มแสดงโจทย์ข้อแรก ---
            renderProblem();
        }

        // --- ฟังก์ชันสำหรับแสดงผลตอนชนะ (เหมือนด่าน 1) ---
        function showWinAnimation(scene) {
            const container = scene.add.container(config.scale.width / 2, config.scale.height / 2).setDepth(10).setAlpha(0).setScale(0.7);
            const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
            const winText = scene.add.text(0, -50, "🎉 เก่งมาก! ผ่านด่านที่ 3 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
            const scoreText = scene.add.text(0, 20, 'ได้รับ +100 คะแนน', { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
            container.add([rect, winText, scoreText]);

            scene.tweens.add({
                targets: container, alpha: 1, scale: 1, duration: 500, ease: 'Power2.easeOut',
                onComplete: () => { sendResult(100); }
            });
        }
        
        // --- ฟังก์ชันสำหรับส่งคะแนน (เหมือนด่าน 1) ---
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

        // --- เริ่มสร้างเกม ---
        new Phaser.Game(config);

    });
})();