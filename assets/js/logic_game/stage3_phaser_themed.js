// File: assets/js/logic_game/stage3_phaser_themed.js (ฉบับแก้ไขครั้งสุดท้าย)

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        
        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 900,
                height: 600,
            },
            parent: "game-container",
            dom: {
                createContainer: true
            },
            scene: {
                preload: preload,
                create: create,
            }
        };
        
        const problems = [
            { sequence: [1, 2, '?', 4], answer: 3 },
            { sequence: [2, 4, '?', 8], answer: 6 },
            { sequence: [5, 10, '?', 20], answer: 15 },
            { sequence: [10, 8, '?', 4], answer: 6 },
            { sequence: [3, 6, 9, '?', 15], answer: 12 }
        ];
        let currentProblemIndex = 0;
        let stageCompleted = false;

        function preload() {
            this.load.audio('correct', '../assets/sound/correct.mp3');
            this.load.audio('wrong', '../assets/sound/wrong.mp3');
        }

        function create() {
            const scene = this;
            // ✅✅✅ เราจะย้ายตัวแปรทั้งหมดที่เกี่ยวกับโจทย์มาไว้ในฟังก์ชัน renderProblem ✅✅✅
            // เพื่อให้แน่ใจว่าทุกอย่างถูกสร้างและทำลายอย่างถูกต้องทุกครั้งที่เปลี่ยนข้อ
            
            // --- สร้าง UI พื้นฐาน (คงเดิม) ---
            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0xfef3c7, 0xfef3c7, 0xbae6fd, 0xbae6fd, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 550, 20);
            
            // --- ฟังก์ชันสำหรับแสดงโจทย์ (เขียนใหม่เกือบทั้งหมด) ---
            function renderProblem() {
                if (stageCompleted) return;

                // ทำลาย object เก่าทิ้งทั้งหมดก่อนเริ่มข้อใหม่
                if (scene.problemGroup) {
                    scene.problemGroup.destroy(true, true);
                }
                
                // สร้าง Group ใหม่สำหรับเก็บทุกอย่างที่เกี่ยวกับโจทย์ข้อนี้
                scene.problemGroup = scene.add.group();
                
                const problem = problems[currentProblemIndex];
                const spacing = 180;
                const startX = (config.scale.width - (problem.sequence.length - 1) * spacing) / 2;
                
                const title = scene.add.text(config.scale.width / 2, 80, `โจทย์ข้อที่ ${currentProblemIndex + 1} / ${problems.length}`, { fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                scene.problemGroup.add(title);
                
                let inputElement; // ตัวแปรสำหรับเก็บช่องกรอกของข้อนี้โดยเฉพาะ

                // วนลูปสร้างตัวเลขและช่องกรอก
                problem.sequence.forEach((item, i) => {
                    const x = startX + i * spacing;
                    const y = 250;

                    if (item === '?') {
                        const inputHTML = `<input type="number" style="width: 120px; height: 90px; font-size: 4.5rem; text-align: center; border: 4px dashed #60a5fa; border-radius: 15px; background-color: #f0f9ff; color: #1e40af; -moz-appearance: textfield;" />`;
                        inputElement = scene.add.dom(x, y).createFromHTML(inputHTML);
                        scene.problemGroup.add(inputElement); // เพิ่มเข้า Group

                    } else {
                        const numberText = scene.add.text(x, y, item, { fontSize: '80px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                        scene.problemGroup.add(numberText);
                    }

                    if (i < problem.sequence.length - 1) {
                       const comma = scene.add.text(x + spacing / 2, y, ',', { fontSize: '80px', color: '#6b7280', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                       scene.problemGroup.add(comma);
                    }
                });

                // สร้างปุ่มตรวจคำตอบ
                const checkButton = scene.add.text(config.scale.width / 2, 450, '✔️ ตรวจคำตอบ', { 
                    fontSize: '28px', color: '#ffffff', backgroundColor: '#16a34a',
                    padding: { x: 30, y: 15 }, borderRadius: 10
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                scene.problemGroup.add(checkButton);
                
                // ✅✅✅ จุดแก้ไขสำคัญ: ส่ง Reference ของ inputElement ไปกับ Event โดยตรง ✅✅✅
                // วิธีนี้เป็นการบอกปุ่มว่า "เมื่อถูกกด ให้ไปดึงค่าจากช่องกรอกอันนี้นะ" ซึ่งแน่นอนกว่าการค้นหา
                checkButton.on('pointerdown', () => {
                    checkAnswer(inputElement); 
                });
                
                const inputNode = inputElement.node.querySelector('input');
                setTimeout(() => inputNode.focus(), 100);
                inputNode.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        checkAnswer(inputElement);
                    }
                });
            }
            
            // ✅✅✅ ฟังก์ชัน checkAnswer ที่รับ Reference มาโดยตรง ✅✅✅
            function checkAnswer(inputElement) {
                if (scene.isChecking) return;
                scene.isChecking = true;

                const inputNode = inputElement.node.querySelector('input');
                if (!inputNode) {
                    scene.isChecking = false;
                    return;
                }

                const userAnswer = parseInt(inputNode.value);
                const correctAnswer = problems[currentProblemIndex].answer;

                if (!isNaN(userAnswer) && userAnswer === correctAnswer) {
                    scene.sound.play('correct');
                    showFeedbackPopup("ถูกต้องแล้ว เก่งมาก!", true, inputElement.x, inputElement.y);
                } else {
                    scene.sound.play('wrong');
                    showFeedbackPopup("ลองอีกครั้งนะ", false, inputElement.x, inputElement.y);
                }
            }
            
            function showFeedbackPopup(message, isCorrect, x, y) {
                const popupContainer = scene.add.container(x, y).setAlpha(0).setDepth(20);
                const iconText = isCorrect ? '🎉' : '🤔';
                const bgColor = isCorrect ? 0x22c55e : 0xef4444;
                const strokeColor = isCorrect ? '#166534' : '#991b1b';
                const bg = scene.add.graphics();

                if (isCorrect) {
                    bg.fillStyle(0xfff7d6, 1).fillStar(0, 0, 12, 100, 160, 0xfde047);
                    bg.lineStyle(8, bgColor, 1).strokeStar(0, 0, 12, 100, 160, 0xfde047);
                } else {
                    bg.fillStyle(0xfff7d6, 1).fillRoundedRect(-150, -80, 300, 160, 20);
                    bg.lineStyle(8, bgColor, 1).strokeRoundedRect(-150, -80, 300, 160, 20);
                }
                popupContainer.add(bg);

                const icon = scene.add.text(0, -20, iconText, { fontSize: '70px' }).setOrigin(0.5);
                const text = scene.add.text(0, 40, message, {
                    fontSize: '32px', fontFamily: 'Kanit, Arial', color: strokeColor, align: 'center',
                    wordWrap: { width: 280, useAdvancedWrap: true }
                }).setOrigin(0.5);
                popupContainer.add([icon, text]);
                
                scene.tweens.add({
                    targets: popupContainer, alpha: 1, scale: { from: 0.5, to: 1 }, duration: 400, ease: 'Bounce.easeOut',
                    onComplete: () => {
                        scene.time.delayedCall(1200, () => {
                            scene.tweens.add({
                                targets: popupContainer, alpha: 0, scale: 0.5, duration: 300, ease: 'Back.easeIn',
                                onComplete: () => {
                                    popupContainer.destroy();
                                    if (isCorrect) {
                                        currentProblemIndex++;
                                        if (currentProblemIndex >= problems.length) {
                                            stageCompleted = true;
                                            showWinAnimation(scene);
                                        } else { renderProblem(); }
                                    }
                                    scene.isChecking = false;
                                }
                            });
                        });
                    }
                });
            }
            
            renderProblem(); // เริ่มแสดงโจทย์ข้อแรก
        }

        function showWinAnimation(scene) {
            if (scene.problemGroup) scene.problemGroup.destroy(true, true);
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

        new Phaser.Game(config);

    });
})();