// File: assets/js/logic_game/stage5.js
// ด่าน 5: ลำดับสี (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// รูปแบบ: เติมช่องว่างสัญลักษณ์ (เลือกจากตัวเลือก)
// ใช้เป็นแม่แบบจาก stage4.js และปรับปรุงสำหรับเนื้อหาด่าน 5
// ไฟล์นี้จะถูกใช้ทับไฟล์เดิมที่อาจมีอยู่

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
        let currentProblemIndex = 0; // ด่านนี้จะมีหลายปัญหาย่อย

        // ✅ ข้อมูลปัญหา: แบบรูปสี, คำตอบที่ถูกต้อง, ตัวเลือก
        // ใช้ชื่อสีเป็น key สำหรับ asset ที่จะโหลด
        const problems = [
            { 
                pattern: ["red_circle", "blue_circle", "red_circle", "?"], 
                answer: "blue_circle", 
                choices: ["blue_circle", "green_circle"] 
            },
            { 
                pattern: ["yellow_square", "yellow_square", "red_square", "?"], 
                answer: "red_square", 
                choices: ["red_square", "blue_square"] 
            },
            { 
                pattern: ["green_triangle", "blue_triangle", "green_triangle", "?"], 
                answer: "blue_triangle", 
                choices: ["blue_triangle", "yellow_triangle"] 
            }
        ];
        let solvedProblems = 0; // นับจำนวนปัญหาที่แก้ได้

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            console.log("Stage 5: Preload started.");
            // ✅ โหลดภาพวงกลมสีต่างๆ (คุณต้องเตรียมไฟล์ภาพเหล่านี้ไว้ในโฟลเดอร์ assets/img/)
            this.load.image("red_circle", "../assets/img/red_circle.webp");
            this.load.image("blue_circle", "../assets/img/blue_circle.webp");
            this.load.image("green_circle", "../assets/img/green_circle.webp");
            this.load.image("yellow_circle", "../assets/img/yellow_circle.webp");

            // ✅ โหลดภาพสี่เหลี่ยมสีต่างๆ
            this.load.image("red_square", "../assets/img/red_square.webp");
            this.load.image("blue_square", "../assets/img/blue_square.webp");
            this.load.image("green_square", "../assets/img/green_square.webp");
            this.load.image("yellow_square", "../assets/img/yellow_square.webp");

            // ✅ โหลดภาพสามเหลี่ยมสีต่างๆ
            this.load.image("red_triangle", "../assets/img/red_triangle.webp");
            this.load.image("blue_triangle", "../assets/img/blue_triangle.webp");
            this.load.image("green_triangle", "../assets/img/green_triangle.webp");
            this.load.image("yellow_triangle", "../assets/img/yellow_triangle.webp");


            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 5: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            console.log("Stage 5: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0;

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 550, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 5: Initial problem rendered.");
        }

        // ฟังก์ชันสำหรับแสดงปัญหาแต่ละข้อย่อย
        function renderProblem(scene, problem) {
            console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);
            // ลบ Element เก่าออกก่อน ถ้ามี
            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = [];

            // แสดงหัวข้อปัญหา
            const titleText = scene.add.text(config.scale.width / 2, 80, `ปัญหาที่ ${currentProblemIndex + 1} จาก ${problems.length}`, { 
                fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial' 
            }).setOrigin(0.5);
            scene.problemElements.push(titleText);

            const shapeSize = 100; // ขนาดที่เราต้องการแสดงผล
            const shapePadding = 40;
            const totalPatternWidth = (problem.pattern.length * shapeSize) + ((problem.pattern.length - 1) * shapePadding);
            const patternStartX = (config.scale.width - totalPatternWidth) / 2 + shapeSize / 2;
            const patternY = 220;

            // สร้างแบบรูป (Pattern)
            problem.pattern.forEach((shapeKey, index) => {
                const x = patternStartX + index * (shapeSize + shapePadding);
                if (shapeKey === "?") {
                    // สร้างช่องว่างสำหรับเติม
                    const blank = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - shapeSize / 2, patternY - shapeSize / 2, shapeSize, shapeSize);
                    const dropZone = scene.add.zone(x, patternY, shapeSize, shapeSize).setRectangleDropZone(shapeSize, shapeSize); 
                    dropZone.setData({ type: "blank", index: index });
                    scene.problemElements.push(blank, dropZone);
                } else {
                    // แสดงรูปทรงที่เป็นส่วนหนึ่งของ Pattern
                    const shapeImage = scene.add.image(x, patternY, shapeKey).setDisplaySize(shapeSize, shapeSize);
                    console.log(`Created pattern shape "${shapeKey}": displaySize(${shapeImage.displayWidth}, ${shapeImage.displayHeight}), scale(${shapeImage.scaleX}, ${shapeImage.scaleY})`);
                    scene.problemElements.push(shapeImage);
                }
            });

            const choiceSize = 100; // ขนาดที่เราต้องการแสดงผลของตัวเลือก
            const choicePadding = 60;
            const totalChoicesWidth = (problem.choices.length * choiceSize) + ((problem.choices.length - 1) * choicePadding);
            const choicesStartX = (config.scale.width - totalChoicesWidth) / 2 + choiceSize / 2;
            const choicesY = 450;

            // สร้างตัวเลือกสำหรับตอบ (Interactive Choices)
            problem.choices.forEach((choiceKey, index) => {
                const x = choicesStartX + index * (choiceSize + choicePadding);
                const choiceImage = scene.add.image(x, choicesY, choiceKey)
                                        .setDisplaySize(choiceSize, choiceSize)
                                        .setInteractive({ useHandCursor: true });
                                        
                // บันทึกตำแหน่งเริ่มต้นของภาพตัวเลือกทันทีที่สร้าง (ใช้สำหรับแอนิเมชันสั่น)
                choiceImage.setData('originalX', x);
                choiceImage.setData('originalY', choicesY);

                console.log(`Created choice "${choiceKey}": displaySize(${choiceImage.displayWidth}, ${choiceImage.displayHeight}), scale(${choiceImage.scaleX}, ${choiceImage.scaleY})`);
                                        
                choiceImage.setData({ type: "choice", value: choiceKey }); // เก็บข้อมูลตัวเลือก
                scene.problemElements.push(choiceImage);

                // เมื่อคลิกตัวเลือก
                choiceImage.on('pointerdown', () => {
                    // รีเซ็ตภาพตัวเลือกอื่นๆ ที่อาจมีการเคลื่อนไหว (จากการสั่นครั้งก่อน) ให้กลับสู่ตำแหน่งเดิมและ scale ปกติ
                    scene.children.list.forEach(child => {
                        if (child.getData && child.getData('type') === 'choice' && child !== choiceImage) { 
                            const childOriginalX = child.getData('originalX');
                            const childOriginalY = child.getData('originalY');
                            if (child.x !== childOriginalX || child.y !== childOriginalY || child.scaleX !== 1) {
                                scene.tweens.add({
                                    targets: child,
                                    x: childOriginalX, // ย้ายกลับตำแหน่งเดิม
                                    y: childOriginalY,
                                    scale: 1, // บังคับ scale กลับ 1
                                    duration: 100,
                                    ease: 'Power1'
                                });
                            }
                        }
                    });
                    checkAnswer(scene, choiceImage, problem.answer);
                });
            });
            console.log("Problem rendered. All choices created.");
        }

        // ฟังก์ชันตรวจสอบคำตอบ
        function checkAnswer(scene, chosenImage, correctAnswer) {
            console.log("CheckAnswer called for:", chosenImage.getData('value'), "Correct:", correctAnswer);
            const problem = problems[currentProblemIndex];

            if (chosenImage.getData('value') === correctAnswer) {
                scene.sound.play('correct');
                const blankZone = scene.children.list.find(el => el.type === 'Zone' && el.getData('type') === 'blank');
                if (blankZone) {
                    const correctShape = scene.add.image(blankZone.x, blankZone.y, chosenImage.getData('value')).setDisplaySize(100, 100);
                    scene.problemElements.push(correctShape);
                    // ปิดการโต้ตอบของตัวเลือกทั้งหมดหลังจากตอบถูกแล้ว
                    problem.choices.forEach(choiceKey => {
                        const img = scene.children.list.find(el => el.type === 'Image' && el.getData('type') === 'choice' && el.getData('value') === choiceKey);
                        if(img) img.disableInteractive().setAlpha(0.5);
                    });
                }
                
                solvedProblems++;
                scene.time.delayedCall(1000, () => {
                    currentProblemIndex++;
                    if (currentProblemIndex < problems.length) {
                        renderProblem(scene, problems[currentProblemIndex]);
                    } else {
                        onStageComplete(scene);
                    }
                });
            } else {
                // ถ้าตอบผิด
                scene.sound.play('wrong');
                scene.cameras.main.shake(150, 0.005); // กล้องสั่น
                attempts++;
                
                // แอนิเมชัน "สั่น" ภาพตัวเลือกที่ตอบผิด
                const originalX = chosenImage.getData('originalX'); 
                const originalY = chosenImage.getData('originalY'); 

                scene.tweens.add({
                    targets: chosenImage,
                    x: originalX + 5, // ขยับไปทางขวาเล็กน้อย
                    yoyo: true,       // ขยับกลับไปมา
                    repeat: 2,        // ทำซ้ำ 2 ครั้ง (รวมเป็น 3 รอบ)
                    duration: 50,     // แต่ละการขยับใช้เวลาสั้นๆ
                    ease: 'Sine.easeInOut', // ทำให้การขยับดูนุ่มนวลขึ้น
                    onComplete: () => {
                        // สำคัญ: บังคับกลับตำแหน่งเดิมเป๊ะๆ หลังจาก Tween จบ เพื่อความชัวร์
                        chosenImage.setPosition(originalX, originalY); 
                        chosenImage.setScale(1); // บังคับ scale กลับ 1 ด้วย
                        console.log("Tween complete (Shake). Final position:", chosenImage.x, chosenImage.y, "Final scale:", chosenImage.scaleX);
                    }
                });
            }
        }

        // --- ฟังก์ชันเมื่อด่านสำเร็จ ---
        function onStageComplete(scene) {
            console.log("Stage 5: onStageComplete called.");
            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts;
            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 30) { starsEarned = 3; }
                else { starsEarned = 2; }
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length) {
                if (durationSeconds <= 60) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0; 
            }

            console.log("Stage 5 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

            scene.time.delayedCall(800, () => {
                if (scene.problemElements) {
                    scene.problemElements.forEach(el => el.destroy());
                }

                const container = scene.add.container(config.scale.width / 2, config.scale.height / 2);
                container.setDepth(10);
                container.setAlpha(0);
                container.setScale(0.7);

                const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
                container.add(rect);

                const winText = scene.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 5 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
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

        new Phaser.Game(config);

    });
})();