// File: assets/js/logic_game/stage4.js
// ด่าน 4: แบบรูปเรขาคณิต (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// รูปแบบ: เติมช่องว่างสัญลักษณ์ (เลือกจากตัวเลือก)
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

        // ✅ ข้อมูลปัญหา: แบบรูป, คำตอบที่ถูกต้อง, ตัวเลือก
        const problems = [
            { 
                pattern: ["circle", "triangle", "circle", "?"], 
                answer: "triangle", 
                choices: ["triangle", "square"] 
            },
            { 
                pattern: ["square", "square", "circle", "circle", "?"], 
                answer: "square", 
                choices: ["square", "triangle", "circle"] 
            },
            { 
                pattern: ["triangle", "circle", "square", "triangle", "?"], 
                answer: "circle", 
                choices: ["circle", "square"] 
            }
        ];
        let solvedProblems = 0; // นับจำนวนปัญหาที่แก้ได้

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            // ✅ โหลดภาพรูปทรงเรขาคณิต (คุณต้องเตรียมไฟล์ภาพเหล่านี้ไว้ในโฟลเดอร์ assets/img/)
            this.load.image("circle", "../assets/img/circle.webp");
            this.load.image("triangle", "../assets/img/triangle.webp");
            this.load.image("square", "../assets/img/square.webp");
            // อาจมีภาพอื่นๆ ที่เกี่ยวข้อง เช่น star, diamond

            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0;

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 550, 20).setDepth(-1); // ขยายพื้นที่สำหรับโจทย์และตัวเลือก

            // ✅ แสดงปัญหาแรก
            renderProblem(scene, problems[currentProblemIndex]);
        }

        // ✅ ฟังก์ชันสำหรับแสดงปัญหาแต่ละข้อ
        function renderProblem(scene, problem) {
            // ลบ Element เก่าออกก่อน ถ้ามี
            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = []; // Array สำหรับเก็บ Element ของโจทย์ปัจจุบัน

            // แสดงหัวข้อปัญหา
            const titleText = scene.add.text(config.scale.width / 2, 80, `ปัญหาที่ ${currentProblemIndex + 1} จาก ${problems.length}`, { 
                fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial' 
            }).setOrigin(0.5);
            scene.problemElements.push(titleText);

            // ตำแหน่งสำหรับแสดงแบบรูป
            const shapeSize = 100;
            const shapePadding = 40;
            const totalPatternWidth = (problem.pattern.length * shapeSize) + ((problem.pattern.length - 1) * shapePadding);
            const patternStartX = (config.scale.width - totalPatternWidth) / 2 + shapeSize / 2;
            const patternY = 220; // ตำแหน่ง Y สำหรับแบบรูป

            // สร้างแบบรูป
            problem.pattern.forEach((shapeKey, index) => {
                const x = patternStartX + index * (shapeSize + shapePadding);
                if (shapeKey === "?") {
                    // สร้างช่องว่างสำหรับเติม
                    const blank = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - shapeSize / 2, patternY - shapeSize / 2, shapeSize, shapeSize);
                    const dropZone = scene.add.zone(x, patternY, shapeSize, shapeSize).setRectangleDropZone(shapeSize, shapeSize);
                    dropZone.setData({ type: "blank", index: index }); // เก็บ index ของช่องว่าง
                    scene.problemElements.push(blank, dropZone);
                } else {
                    // แสดงรูปทรง
                    const shapeImage = scene.add.image(x, patternY, shapeKey).setDisplaySize(shapeSize, shapeSize);
                    scene.problemElements.push(shapeImage);
                }
            });

            // สร้างตัวเลือกสำหรับตอบ
            const choiceSize = 100;
            const choicePadding = 60;
            const totalChoicesWidth = (problem.choices.length * choiceSize) + ((problem.choices.length - 1) * choicePadding);
            const choicesStartX = (config.scale.width - totalChoicesWidth) / 2 + choiceSize / 2;
            const choicesY = 450; // ตำแหน่ง Y สำหรับตัวเลือก

            problem.choices.forEach((choiceKey, index) => {
                const x = choicesStartX + index * (choiceSize + choicePadding);
                const choiceImage = scene.add.image(x, choicesY, choiceKey).setDisplaySize(choiceSize, choiceSize).setInteractive({ useHandCursor: true });
                choiceImage.setData({ type: "choice", value: choiceKey }); // เก็บค่าของตัวเลือก
                scene.problemElements.push(choiceImage);

                // เมื่อคลิกตัวเลือก
                choiceImage.on('pointerdown', () => {
                    checkAnswer(scene, choiceImage, problem.answer);
                });
            });
        }

        // ✅ ฟังก์ชันตรวจสอบคำตอบ
        function checkAnswer(scene, chosenImage, correctAnswer) {
            const problem = problems[currentProblemIndex]; // ปัญหาปัจจุบัน

            if (chosenImage.getData('value') === correctAnswer) {
                // ถ้าตอบถูก
                scene.sound.play('correct');
                const blankZone = scene.children.list.find(el => el.type === 'Zone' && el.getData('type') === 'blank');
                if (blankZone) {
                    // สร้างภาพรูปทรงที่เลือกแล้วย้ายไปแทนที่ช่องว่าง
                    const correctShape = scene.add.image(blankZone.x, blankZone.y, chosenImage.getData('value')).setDisplaySize(100, 100);
                    scene.problemElements.push(correctShape);
                    // ปิดการโต้ตอบของตัวเลือกทั้งหมดหลังจากตอบแล้ว
                    problem.choices.forEach(choiceKey => {
                        const img = scene.children.list.find(el => el.type === 'Image' && el.getData('type') === 'choice' && el.getData('value') === choiceKey);
                        if(img) img.disableInteractive().setAlpha(0.5); // ปิดการโต้ตอบและจางลง
                    });
                }
                
                solvedProblems++; // นับว่าแก้ปัญหาย่อยได้ 1 ข้อ
                scene.time.delayedCall(1000, () => { // หน่วงเวลาเล็กน้อยก่อนไปปัญหาถัดไป
                    currentProblemIndex++;
                    if (currentProblemIndex < problems.length) {
                        renderProblem(scene, problems[currentProblemIndex]); // แสดงปัญหาถัดไป
                    } else {
                        // แก้ปัญหาครบทุกข้อแล้ว
                        onStageComplete(scene);
                    }
                });
            } else {
                // ถ้าตอบผิด
                scene.sound.play('wrong');
                scene.cameras.main.shake(150, 0.005);
                attempts++; // นับ Attempts เพิ่มเมื่อตอบผิด
                // ให้ตัวเลือกที่ตอบผิดกระพริบหรือสั่นเตือน
                scene.tweens.add({
                    targets: chosenImage,
                    scale: 1.1,
                    yoyo: true, // ทำให้กลับไปขนาดเดิม
                    duration: 100,
                    repeat: 1, // กระพริบ 2 ครั้ง
                    onComplete: () => {
                        chosenImage.setScale(1); // กลับไปขนาดปกติ
                    }
                });
            }
        }

        // --- ฟังก์ชันเมื่อด่านสำเร็จ ---
        function onStageComplete(scene) {
            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts; // ใช้ค่า attempts สุดท้ายที่นับได้

            // เกณฑ์การให้ดาวสำหรับด่านนี้ (ปรับได้ตามความเหมาะสม)
            // พิจารณาจากจำนวนปัญหาที่แก้ได้ (solvedProblems) และจำนวนครั้งที่ตอบผิด (attempts)
            if (solvedProblems === problems.length && finalAttempts === 0) {
                // แก้ถูกทุกข้อตั้งแต่ครั้งแรก และไม่มีการตอบผิดเลย
                if (durationSeconds <= 30) { starsEarned = 3; } // เร็ว
                else { starsEarned = 2; } // ช้าหน่อย
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length) {
                // แก้ถูกทุกข้อ แต่มีตอบผิดไม่เกินจำนวนปัญหา (เฉลี่ยตอบผิดไม่เกิน 1 ครั้งต่อข้อ)
                if (durationSeconds <= 60) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                // แก้ถูกทุกข้อ แต่ตอบผิดหลายครั้ง
                starsEarned = 1;
            } else {
                // แก้ไม่ครบทุกข้อ (แต่ด่านนี้ควรจะแก้ครบ)
                starsEarned = 0; 
            }

            // Debug: แสดงค่าที่คำนวณได้ใน Console ก่อนส่ง
            console.log("Stage 4 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

            // แสดงแอนิเมชันเมื่อด่านสำเร็จ
            scene.time.delayedCall(800, () => {
                // ลบ Element เก่าของปัญหาปัจจุบันออกก่อนแสดงหน้าจอชนะ
                if (scene.problemElements) {
                    scene.problemElements.forEach(el => el.destroy());
                }

                const container = scene.add.container(config.scale.width / 2, config.scale.height / 2);
                container.setDepth(10);
                container.setAlpha(0);
                container.setScale(0.7);

                const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
                container.add(rect);

                const winText = scene.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 4 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
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