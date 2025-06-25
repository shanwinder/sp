// File: assets/js/logic_game/stage1.js (ฉบับแก้ไขการแสดงผลภาพ)

// ห่อหุ้มโค้ดทั้งหมดเพื่อป้องกันการขัดแย้งกับสคริปต์อื่น
(function() {

    // รอให้ DOM ของหน้าเว็บพร้อมใช้งานก่อนค่อยเริ่มทุกอย่าง
    document.addEventListener('DOMContentLoaded', function() {

        const config = {
            type: Phaser.AUTO,
            width: 900,
            height: 600,
            parent: "game-container",
            scene: {
                preload: preload,
                create: create
            }
        };

        function preload() {
            this.load.image("cat", "../assets/img/cat.webp");
            this.load.image("dog", "../assets/img/dog.webp");
            this.load.image("rabbit", "../assets/img/rabbit.webp");
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;

            // --- 1. UI พื้นฐาน ---
            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0xfef3c7, 0xfef3c7, 0xbae6fd, 0xbae6fd, 1);
            graphics.fillRect(0, 0, 900, 600);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);
            scene.add.text(450, 60, "โจทย์: สังเกตและเรียงลำดับให้ถูกต้อง", { fontSize: '28px', color: '#b45309', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
            
            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);
            scene.add.text(450, 375, "ตัวเลือก: ลากไปวางในช่องว่าง", { fontSize: '24px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);

            const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            particleGraphics.fillStyle(0xffd700);
            particleGraphics.fillRect(0, 0, 8, 8);
            particleGraphics.generateTexture('gold_particle', 8, 8);


            // --- 2. การสร้างโจทย์และ Drop Zones ---
            const sequence = ["dog", "cat", "rabbit", "dog", "cat", "rabbit"];
            const missingIndices = [2, 4];
            const dropZones = [];

            for (let i = 0; i < 6; i++) {
                const x = 150 + i * 120;
                const y = 180;
                if (missingIndices.includes(i)) {
                    const outline = scene.add.graphics().lineStyle(3, 0x9ca3af).strokeRect(x - 50, y - 50, 100, 100);
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    zone.setData({ answer: sequence[i], isFilled: false, outline: outline });
                    dropZones.push(zone);
                } else {
                    scene.add.image(x, y, sequence[i]).setDisplaySize(100, 100);
                }
            }

            // --- 3. การสร้างตัวเลือก ---
            const options = Phaser.Utils.Array.Shuffle(["cat", "rabbit", "dog"]);
            options.forEach((animal, index) => {
                const x = 270 + index * 180;
                const y = 480;
                const dragItem = scene.add.image(x, y, animal).setDisplaySize(100, 100).setInteractive({ useHandCursor: true });
                dragItem.setData({ type: animal, originalX: x, originalY: y });
                scene.input.setDraggable(dragItem);
            });

            // --- 4. ตรรกะการลาก-วาง พร้อม 'ลูกเล่น' ที่ปลอดภัย ---
            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                gameObject.setTint(0xfff7d6);
                // ✅✅✅ แก้ไข: ใช้การ animate displayWidth และ displayHeight แทน scale ✅✅✅
                scene.tweens.add({
                    targets: gameObject,
                    displayWidth: 110, // ขยายความกว้างเป็น 110px
                    displayHeight: 110, // ขยายความสูงเป็น 110px
                    duration: 150
                });
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                gameObject.clearTint();
                const isCorrect = !dropZone.data.values.isFilled && dropZone.data.values.answer === gameObject.getData('type');
                
                if (isCorrect) {
                    gameObject.disableInteractive();
                    scene.sound.play('correct');
                    
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y,
                        displayWidth: 100, displayHeight: 100, // ย่อกลับขนาดเดิม
                        duration: 200, ease: 'Power2',
                        onComplete: () => {
                            const emitter = scene.add.particles(dropZone.x, dropZone.y, 'gold_particle', {
                                speed: 100, lifespan: 300, scale: { start: 1, end: 0 }, emitting: true, frequency: -1, quantity: 15
                            });
                            scene.time.delayedCall(500, () => emitter.destroy());
                        }
                    });
                    
                    dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100);
                    dropZone.setData('isFilled', true);
                    
                    checkCompletion(scene, dropZones);
                } else {
                    scene.sound.play('wrong');
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100, // ย่อกลับขนาดเดิม
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) {
                    gameObject.clearTint();
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100, // ย่อกลับขนาดเดิม
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }

        function checkCompletion(scene, dropZones) {
            const correctCount = dropZones.filter(zone => zone.getData('isFilled')).length;
            if (correctCount === dropZones.length) {
                scene.time.delayedCall(800, () => {
                    const rect = scene.add.rectangle(450, 300, 900, 600, 0x000000, 0.7).setInteractive();
                    scene.add.text(450, 250, "🎉 เก่งมาก! ผ่านด่านที่ 1 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
                    scene.add.text(450, 320, 'ได้รับ +100 คะแนน', { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                    
                    sendStageScore(100);
                });
            }
        }

        function sendStageScore(score) {
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

        new Phaser.Game(config);
    });

})();