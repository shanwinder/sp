// File: assets/js/logic_game/stage3.js
// ด่าน 3: ลำดับการเกิดผล (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ไฟล์นี้จะถูกใช้ทับไฟล์เดิมที่อาจมีอยู่ (เช่น stage3_phaser_themed.js หรือ stage3.js เดิม)

(function() {
    document.addEventListener('DOMContentLoaded', function() {

        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 900,
                height: 600
            },
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

        let startTime;     // เวลาเริ่มต้นเล่นด่าน
        let attempts = 0;  // จำนวนครั้งที่พยายามตอบผิด

        function preload() {
            // ✅ โหลดภาพสำหรับลำดับเหตุและผล (คุณต้องเตรียมไฟล์ภาพเหล่านี้ไว้ในโฟลเดอร์ assets/img/)
            // ตัวอย่าง: การปลูกต้นไม้
            this.load.image("seed", "../assets/img/seed.webp");
            this.load.image("sprout", "../assets/img/sprout.webp");
            this.load.image("plant", "../assets/img/plant.webp");
            this.load.image("flower", "../assets/img/flower.webp");
            // หากมีภาพอื่นๆ เพิ่มเติมในลำดับ สามารถโหลดเพิ่มที่นี่ได้

            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;

            startTime = Date.now();
            attempts = 0; // เริ่มต้น attempts เป็น 0 (จะนับเมื่อตอบผิดครั้งแรก)

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);
            scene.add.text(450, 60, "โจทย์: จัดเรียงลำดับเหตุและผลให้ถูกต้อง", { fontSize: '28px', color: '#b45309', fontFamily: 'Kanit, Arial' }).setOrigin(0.5); // ✅ เปลี่ยนข้อความโจทย์
            
            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);
            scene.add.text(450, 375, "ตัวเลือก: ลากไปวางในช่องว่าง", { fontSize: '24px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);

            // ✅ กำหนดลำดับภาพที่ถูกต้องสำหรับด่าน 3
            const sequence = ["seed", "sprout", "plant", "flower"]; // ชื่อไฟล์ภาพ (ไม่รวม .webp)
            const missingIndices = [1, 3]; // ✅ ตำแหน่งของช่องว่าง (นับจาก 0) เช่น ภาพที่ 2 และ 4 หายไป
            const dropZones = [];

            // คำนวณตำแหน่ง X เพื่อให้เหมาะสมกับจำนวนภาพ (ในตัวอย่างนี้มี 4 ภาพ)
            const numImages = sequence.length;
            const imageSize = 100;
            const imagePadding = 60; // ระยะห่างระหว่างภาพ (ปรับได้)
            const totalWidth = (numImages * imageSize) + ((numImages - 1) * imagePadding);
            const startX = (config.scale.width - totalWidth) / 2 + imageSize / 2; // คำนวณจุดเริ่มต้น X ให้จัดกึ่งกลาง

            for (let i = 0; i < numImages; i++) {
                const x = startX + i * (imageSize + imagePadding);
                const y = 180; 
                if (missingIndices.includes(i)) {
                    const outline = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - 50, y - 50, 100, 100);
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    zone.setData({ answer: sequence[i], isFilled: false, outline: outline });
                    dropZones.push(zone);
                } else {
                    scene.add.image(x, y, sequence[i]).setDisplaySize(100, 100);
                }
            }

            // ✅ กำหนดตัวเลือกสำหรับลาก (ต้องเป็นภาพที่หายไปใน missingIndices)
            const options = Phaser.Utils.Array.Shuffle(["sprout", "flower"]); // ตัวเลือกคือภาพที่หายไป (สลับตำแหน่ง)
            
            // คำนวณตำแหน่ง X สำหรับตัวเลือก (ปรับได้)
            const optionsStartX = (config.scale.width - (options.length - 1) * 180) / 2; // ใช้ระยะห่าง 180px เหมือนเดิม
            options.forEach((imageKey, index) => {
                const x = optionsStartX + index * 180;
                const y = 480; // ตำแหน่ง Y เดิม
                const dragItem = scene.add.image(x, y, imageKey).setDisplaySize(100, 100).setInteractive({ useHandCursor: true });
                dragItem.setData({ type: imageKey, originalX: x, originalY: y });
                scene.input.setDraggable(dragItem);
            });

            // --- จัดการ Event การลากและวาง (เหมือนเดิมกับ stage1.js) ---
            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                gameObject.setTint(0xfff7d6);
                scene.tweens.add({ targets: gameObject, displayWidth: 110, displayHeight: 110, duration: 150 });
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                gameObject.clearTint();
                const isCorrect = !dropZone.data.values.isFilled && dropZone.data.values.answer === gameObject.getData('type');
                
                if (isCorrect) {
                    scene.sound.play('correct');
                    gameObject.disableInteractive();
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y, 
                        displayWidth: 100, displayHeight: 100,
                        duration: 200, ease: 'Power2'
                    });
                    
                    dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100);
                    dropZone.setData('isFilled', true);
                    
                    checkCompletion(scene, dropZones);
                } else {
                    scene.sound.play('wrong');
                    scene.cameras.main.shake(150, 0.005);
                    attempts++; 
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100,
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
                        displayWidth: 100, displayHeight: 100,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }

        // --- ฟังก์ชันตรวจสอบความสำเร็จของด่าน (เหมือนเดิมกับ stage1.js) ---
        function checkCompletion(scene, dropZones) {
            const correctCount = dropZones.filter(zone => zone.getData('isFilled')).length;
            if (correctCount === dropZones.length) {
                const endTime = Date.now();
                const durationSeconds = Math.floor((endTime - startTime) / 1000);
                let starsEarned = 0;

                const finalAttempts = attempts; 
                // เกณฑ์การให้ดาว (สามารถปรับได้ตามความเหมาะสมของด่าน 3)
                if (finalAttempts === 0) { // ตอบถูกทุกช่องในครั้งแรก โดยไม่มีการตอบผิดเลย
                     if (durationSeconds <= 15) { starsEarned = 3; } 
                     else if (durationSeconds <= 30) { starsEarned = 2; } 
                     else { starsEarned = 1; } 
                } else if (finalAttempts <= 2) { // ตอบผิดไม่เกิน 2 ครั้ง
                    if (durationSeconds <= 45) { starsEarned = 2; } 
                    else { starsEarned = 1; } 
                } else { // ตอบผิดมากกว่า 2 ครั้ง
                    starsEarned = 1;
                }

                console.log("Stage 3 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts:", finalAttempts); // ✅ เปลี่ยนเลขด่านใน Log

                scene.time.delayedCall(800, () => {
                    const container = scene.add.container(config.scale.width / 2, config.scale.height / 2);
                    container.setDepth(10);
                    container.setAlpha(0);
                    container.setScale(0.7);

                    const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
                    container.add(rect);

                    const winText = scene.add.text(0, -50, "🎉 เก่งมาก! ผ่านด่านที่ 3 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); // ✅ เปลี่ยนเลขด่านในข้อความชนะ
                    container.add(winText);

                    const scoreText = scene.add.text(0, 20, `ได้รับ ${starsEarned} ดาว!`, { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                    container.add(scoreText);

                    scene.tweens.add({
                        targets: container,
                        alpha: 1,
                        scale: 1,
                        duration: 500,
                        ease: 'Power2.easeOut',
                        onComplete: () => {
                            window.sendResult(STAGE_ID, starsEarned, durationSeconds, finalAttempts);
                        }
                    });
                });
            }
        }

        new Phaser.Game(config);

    });
})();