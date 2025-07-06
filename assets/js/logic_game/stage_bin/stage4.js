// File: assets/js/logic_game/stage4.js (ปรับปรุงปุ่ม)

(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 900,
                height: 650
            },
            // ✅✅✅ ส่วนที่เพิ่มเข้ามาเพื่อแก้ปัญหาการเลื่อนสกอลล์ ✅✅✅
            input: {
                mouse: {
                    preventDefaultWheel: false
                }
            },
            parent: "game-container",
            scene: {
                preload: preload,
                create: create
            }
        };

        function preload() {
            this.load.audio('correct', '../assets/sound/correct.mp3');
            this.load.audio('wrong', '../assets/sound/wrong.mp3');
        }

        function create() {
            const scene = this;

            // --- UI พื้นฐาน ---
            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);

            const panel = scene.add.graphics();
            panel.fillStyle(0xffffff, 0.9).fillRoundedRect(25, 25, 850, 600, 20);

            // --- ชุดคำถามและคำตอบ ---
            const problemSets = [
                { conditions: ["สีเขียวอยู่ทางขวาสุด", "สีแดงอยู่ติดกับสีเหลือง", "สีน้ำเงินอยู่ระหว่างสีแดงและสีม่วง"], solution: ["yellow", "red", "blue", "purple", "green"] },
                { conditions: ["สีเหลืองอยู่ซ้ายสุด", "สีแดงอยู่ทางขวาของสีน้ำเงิน", "สีม่วงไม่ได้อยู่ติดกับสีเขียว"], solution: ["yellow", "green", "blue", "red", "purple"] }
            ];
            const currentProblem = Phaser.Math.RND.pick(problemSets);
            const colors = ["red", "green", "blue", "yellow", "purple"];
            const colorHex = { red: 0xff4136, green: 0x2ecc40, blue: 0x0074d9, yellow: 0xffdc00, purple: 0xb10dc9 };

            const conditionBg = scene.add.graphics();
            conditionBg.fillStyle(0xfff7d6, 0.8).fillRoundedRect(100, 50, 700, 150, 15);
            scene.add.text(config.scale.width / 2, 80, "📜 เงื่อนไขที่ต้องทำตาม 📜", { fontSize: '28px', color: '#b45309', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
            currentProblem.conditions.forEach((condition, index) => {
                scene.add.text(140, 125 + (index * 35), `- ${condition}`, { fontSize: '22px', color: '#333', fontFamily: 'Kanit, Arial' }).setOrigin(0, 0.5);
            });

            // --- Layout และองค์ประกอบเกม ---
            const solutionSlots = [];
            const solutionY = 280;
            const choiceY = 450;
            const buttonY = 570;

            for (let i = 0; i < 5; i++) {
                const x = 210 + (i * 120);
                const slot = scene.add.circle(x, solutionY, 50, 0xf1f5f9, 0.9).setStrokeStyle(4, 0x94a3b8);
                slot.setData({ index: i, occupiedBy: null });
                solutionSlots.push(slot);
            }

            const shuffledColors = Phaser.Utils.Array.Shuffle([...colors]);
            shuffledColors.forEach((color, i) => {
                const x = 210 + (i * 120);
                const ball = scene.add.circle(x, choiceY, 40, colorHex[color]).setStrokeStyle(3, 0x555555);
                ball.setInteractive({ useHandCursor: true });
                ball.setData({ id: color, originalX: x, originalY: choiceY });
                scene.input.setDraggable(ball);
            });

            // --- ตรรกะการลากวาง (ไม่มีการเปลี่ยนแปลง) ---
            scene.input.on('dragstart', (p, go) => { scene.children.bringToTop(go); go.setScale(1.15); });
            scene.input.on('drag', (p, go, dX, dY) => { go.x = dX; go.y = dY; });
            scene.input.on('dragend', (p, go, dropped) => { if (!dropped) { scene.tweens.add({ targets: go, x: go.getData('originalX'), y: go.getData('originalY'), scale: 1, duration: 300, ease: 'Power2' }); } });
            solutionSlots.forEach(slot => { slot.setInteractive().input.dropZone = true; slot.on('pointerover', () => slot.setStrokeStyle(4, 0x22c55e, 1)); slot.on('pointerout', () => slot.setStrokeStyle(4, 0x94a3b8, 1)); });
            scene.input.on('drop', (p, go, dz) => { const oldSlot = solutionSlots.find(s => s.getData('occupiedBy') === go); if (oldSlot) oldSlot.setData('occupiedBy', null); if (dz.getData('occupiedBy')) { const otherBall = dz.getData('occupiedBy'); if (oldSlot) { otherBall.x = oldSlot.x; otherBall.y = solutionY; oldSlot.setData('occupiedBy', otherBall); } else { otherBall.x = otherBall.getData('originalX'); otherBall.y = otherBall.getData('originalY'); } } go.x = dz.x; go.y = dz.y; go.setScale(1); dz.setData('occupiedBy', go); });

            // ✅✅✅ แก้ไข: ดีไซน์ปุ่มตรวจคำตอบใหม่ ✅✅✅
            const buttonContainer = scene.add.container(config.scale.width / 2, buttonY);

            const buttonBg = scene.add.graphics();
            buttonBg.fillStyle(0x16a34a, 1); // สีเขียว
            buttonBg.fillRoundedRect(-150, -30, 300, 60, 15);

            const buttonText = scene.add.text(0, 0, '✔️ ตรวจคำตอบ', {
                fontSize: '24px', color: '#ffffff', fontFamily: 'Kanit, Arial'
            }).setOrigin(0.5);

            buttonContainer.add([buttonBg, buttonText]);
            buttonContainer.setSize(300, 60).setInteractive({ useHandCursor: true });

            buttonContainer.on('pointerover', () => buttonBg.fillStyle(0x15803d, 1).fillRoundedRect(-150, -30, 300, 60, 15));
            buttonContainer.on('pointerout', () => buttonBg.fillStyle(0x16a34a, 1).fillRoundedRect(-150, -30, 300, 60, 15));
            buttonContainer.on('pointerdown', () => {
                const currentSolution = solutionSlots.map(slot => slot.getData('occupiedBy')?.getData('id'));
                if (currentSolution.includes(undefined)) {
                    scene.cameras.main.shake(150, 0.005);
                    return;
                }

                const isCorrect = JSON.stringify(currentSolution) === JSON.stringify(currentProblem.solution);
                if (isCorrect) {
                    scene.sound.play('correct');
                    showWinAnimation(scene);
                } else {
                    scene.sound.play('wrong');
                    scene.cameras.main.shake(200, 0.01);
                }
            });

        }

        function showWinAnimation(scene) { /* ... */ }
        function sendResult(score) { /* ... */ }

        // --- คัดลอกฟังก์ชันทั้งหมดมาวาง ---
        function showWinAnimation(scene) { const container = scene.add.container(config.scale.width / 2, config.scale.height / 2); container.setDepth(10).setAlpha(0).setScale(0.7); const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive(); container.add(rect); const winText1 = scene.add.text(0, -60, "🎉 ยอดเยี่ยมมาก! 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); const winText2 = scene.add.text(0, 0, "คุณผ่านด่านเรียงสีตามเงื่อนไข", { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); const winText3 = scene.add.text(0, 50, "ได้รับ +100 คะแนน", { fontSize: '28px', color: '#ffffff', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); container.add([winText1, winText2, winText3]); scene.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 500, ease: 'Power2.easeOut', onComplete: () => { sendResult(100); } }); }
        function sendResult(score) { fetch('../api/submit_stage_score.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `stage_id=${STAGE_ID}&score=${score}` }).then(() => { if (typeof window.updateScoreBar === 'function') { window.updateScoreBar(); } if (typeof window.triggerAutoNextStage === 'function') { window.triggerAutoNextStage(); } }); }

        new Phaser.Game(config);
    });
})();
