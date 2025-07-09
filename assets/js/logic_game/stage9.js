// File: assets/js/logic_game/stage9.js
// ด่าน 9: วัตถุเปลี่ยนรูป (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ✅ รูปแบบ: Drag & Drop คาดการณ์ผลลัพธ์การเปลี่ยนแปลงวัตถุ

(function () {
    document.addEventListener('DOMContentLoaded', function () {

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
        let solvedProblems = 0; // นับจำนวนปัญหาย่อยที่แก้ได้

        // ✅ ข้อมูลปัญหา: วัตถุเริ่มต้น, กฎการเปลี่ยนแปลง, คำตอบที่ถูกต้อง (ภาพผลลัพธ์), ตัวเลือก
        const problems = [
            { // ปัญหาที่ 1: เปลี่ยนสีและหมุน
                rule: "สี่เหลี่ยมสีน้ำเงิน จะกลายเป็นอะไรเมื่อ: 1.เปลี่ยนเป็นสีแดง 2.หมุน 90 องศา",
                initialObject: "blue_square", // ภาพเริ่มต้น
                transformations: ["เปลี่ยนสี: แดง", "หมุน: 90°"], // คำอธิบายกฎ (ข้อความ)
                correctAnswer: "red_square_rotated_90", // ชื่อ Asset ของภาพผลลัพธ์ที่ถูกต้อง
                options: Phaser.Utils.Array.Shuffle(["red_square_rotated_90", "red_square_normal", "blue_square_rotated_90", "green_square_normal"])
            },
            { // ปัญหาที่ 2: ขยายและเปลี่ยนรูปทรง
                rule: "วงกลมสีเขียว จะกลายเป็นอะไรเมื่อ: 1.ขยาย 2 เท่า 2.เปลี่ยนเป็นรูปสามเหลี่ยม",
                initialObject: "green_circle",
                transformations: ["ขยาย: 2X", "เปลี่ยนรูปทรง: สามเหลี่ยม"],
                correctAnswer: "green_triangle_large",
                options: Phaser.Utils.Array.Shuffle(["green_triangle_large", "green_circle_large", "blue_triangle_large", "red_triangle_large"])
            },
            { // ปัญหาที่ 3: สะท้อนและเปลี่ยนสี
                rule: "สามเหลี่ยมสีแดง จะกลายเป็นอะไรเมื่อ: 1.สะท้อนแนวนอน 2.เปลี่ยนเป็นสีฟ้า",
                initialObject: "red_triangle",
                transformations: ["สะท้อน: แนวนอน", "เปลี่ยนสี: ฟ้า"],
                correctAnswer: "blue_triangle_flipped",
                options: Phaser.Utils.Array.Shuffle(["blue_triangle_flipped", "red_triangle_normal", "blue_triangle_normal", "green_triangle_flipped"])
            }
        ];

        let targetDropZone; // พื้นที่เป้าหมายสำหรับวางผลลัพธ์
        let draggableOptions = []; // Array เก็บตัวเลือกที่ลากได้

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            console.log("Stage 9: Preload started.");
            // ✅ โหลดภาพวัตถุเริ่มต้นและภาพผลลัพธ์การแปลงต่างๆ (ต้องเตรียม Asset เหล่านี้)
            // (คุณต้องสร้างภาพผลลัพธ์ที่เป็นไปได้ทั้งหมดที่นี่)
            this.load.image("blue_square", "../assets/img/objects/blue_square.webp");
            this.load.image("red_square_rotated_90", "../assets/img/objects/red_square_rotated_90.webp");
            this.load.image("red_square_normal", "../assets/img/objects/red_square_normal.webp"); // ตัวหลอก
            this.load.image("blue_square_rotated_90", "../assets/img/objects/blue_square_rotated_90.webp"); // ตัวหลอก
            this.load.image("green_square_normal", "../assets/img/objects/green_square_normal.webp"); // ตัวหลอก


            this.load.image("green_circle", "../assets/img/objects/green_circle.webp");
            this.load.image("green_triangle_large", "../assets/img/objects/green_triangle_large.webp"); // ผลลัพธ์
            this.load.image("green_circle_large", "../assets/img/objects/green_circle_large.webp"); // ตัวหลอก
            this.load.image("blue_triangle_large", "../assets/img/objects/blue_triangle_large.webp"); // ตัวหลอก
            this.load.image("red_triangle_large", "../assets/img/objects/red_triangle_large.webp"); // ตัวหลอก

            this.load.image("red_triangle", "../assets/img/objects/red_triangle.webp");
            this.load.image("blue_triangle_flipped", "../assets/img/objects/blue_triangle_flipped.webp"); // ผลลัพธ์
            this.load.image("red_triangle_normal", "../assets/img/objects/red_triangle_normal.webp"); // ตัวหลอก
            this.load.image("blue_triangle_normal", "../assets/img/objects/blue_triangle_normal.webp"); // ตัวหลอก
            this.load.image("green_triangle_flipped", "../assets/img/objects/green_triangle_flipped.webp"); // ตัวหลอก


            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 9: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            console.log("Stage 9: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0;
            solvedProblems = 0;
            currentProblemIndex = 0;

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1); // พื้นหลังไล่สี
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);

            // พื้นที่แสดงโจทย์และกฎ
            const problemZoneBg = scene.add.graphics();
            problemZoneBg.fillStyle(0xFFFFF0, 0.9)
                .lineStyle(3, 0xFFA000);
            problemZoneBg.strokeRoundedRect(25, 25, 850, 300, 20);
            problemZoneBg.fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);

            // พื้นที่แสดงตัวเลือกผลลัพธ์
            const choicesZoneBg = scene.add.graphics();
            choicesZoneBg.fillStyle(0xF0F8FF, 0.9)
                .lineStyle(3, 0x4682B4);
            choicesZoneBg.strokeRoundedRect(25, 350, 850, 225, 20);
            choicesZoneBg.fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 9: Initial problem rendered.");

            // ✅ Event handlers สำหรับการลากและวาง (นำมาจาก stage8.js)
            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                gameObject.setTint(0xfff7d6);
                gameObject.setScale(1.1); // ขยายเล็กน้อยตอนเริ่มลาก
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                gameObject.clearTint();

                // ตรวจสอบว่าเป็น Drop Zone เป้าหมาย และยังว่างอยู่
                const isCorrectDropZone = dropZone.getData('type') === 'target_area' && !dropZone.getData('isFilled');

                // ตรวจสอบว่าภาพผลลัพธ์ที่ลากมาถูกต้องตามคำตอบหรือไม่
                if (isCorrectDropZone && gameObject.getData('itemType') === problems[currentProblemIndex].correctAnswer) {
                    scene.sound.play('correct');
                    gameObject.disableInteractive(); // ปิดการโต้ตอบของตัวเลือกที่จัดแล้ว

                    // ย้ายภาพไปที่ตำแหน่งกลางของ Drop Zone
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y,
                        scale: 1, // กลับขนาดปกติ
                        duration: 200, ease: 'Power2'
                    });

                    dropZone.setData('isFilled', true); // ตั้งค่าว่าช่องถูกเติมแล้ว
                    // ไม่มี outline สำหรับ target area แต่มี tint
                    // dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100); 

                    checkProblemCompletion(scene); // ตรวจสอบว่าปัญหาปัจจุบันถูกแก้ครบแล้วหรือยัง
                } else { // กรณีตอบผิด
                    scene.sound.play('wrong');
                    scene.cameras.main.shake(150, 0.005); // กล้องสั่น
                    attempts++;

                    const originalX = gameObject.getData('originalX');
                    const originalY = gameObject.getData('originalY');

                    // แอนิเมชัน "สั่น" อย่างเดียว ภาพคงเดิม
                    scene.tweens.add({
                        targets: gameObject,
                        x: originalX + 5,
                        yoyo: true,
                        repeat: 2,
                        duration: 50,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            gameObject.setPosition(originalX, originalY);
                            gameObject.setScale(1);
                            console.log("Tween complete (Shake). Final position:", gameObject.x, gameObject.y, "Final scale:", gameObject.scaleX);
                        }
                    });
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) { // ถ้าไม่ได้ปล่อยลงใน Drop Zone
                    gameObject.clearTint();
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        scale: 1,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }


        // ✅ ฟังก์ชันสำหรับแสดงปัญหาแต่ละข้อย่อย
        function renderProblem(scene, problem) {
            console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);
            if (!problem || !problem.initialObject || !Array.isArray(problem.transformations) || !Array.isArray(problem.options)) { // ตรวจสอบข้อมูลปัญหา
                console.error("Critical Error: problem data is invalid/incomplete in renderProblem. Cannot render stage.", problem);
                return;
            }

            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = [];

            // ✅ แสดงกฎการเปลี่ยนแปลง (Rule)
            const ruleText = scene.add.text(config.scale.width / 2, 60, `กฎ: ${problem.rule}`, {
                fontSize: '28px', color: '#1e3a8a', fontFamily: 'Kanit, Arial', align: 'center', wordWrap: { width: 800 }
            }).setOrigin(0.5);
            scene.problemElements.push(ruleText);

            // ✅ แสดงวัตถุเริ่มต้น (Initial Object)
            const initialObjSize = 120;
            const initialObjX = 200;
            const initialObjY = 200;
            const initialObjectImage = scene.add.image(initialObjX, initialObjY, problem.initialObject)
                .setDisplaySize(initialObjSize, initialObjSize);
            scene.problemElements.push(initialObjectImage);

            // ✅ แสดงลูกศรและกฎการเปลี่ยนแปลง
            const arrowX = initialObjX + initialObjSize / 2 + 50; // ตำแหน่งลูกศร
            const arrowY = initialObjY;
            const ruleSpacingY = 40; // ระยะห่างระหว่างกฎ

            problem.transformations.forEach((transformRule, index) => {
                // สร้างลูกศร (ใช้ graphics วาดง่ายกว่าโหลดภาพ)
                const arrowGraphics = scene.add.graphics();
                arrowGraphics.lineStyle(3, 0x888888);
                arrowGraphics.lineBetween(arrowX, arrowY - 10 + (index * ruleSpacingY), arrowX + 50, arrowY - 10 + (index * ruleSpacingY)); // เส้น
                arrowGraphics.lineBetween(arrowX + 50, arrowY - 10 + (index * ruleSpacingY), arrowX + 40, arrowY - 15 + (index * ruleSpacingY)); // หัวลูกศร
                arrowGraphics.lineBetween(arrowX + 50, arrowY - 10 + (index * ruleSpacingY), arrowX + 40, arrowY - 5 + (index * ruleSpacingY)); // หัวลูกศร
                scene.problemElements.push(arrowGraphics);

                // แสดงข้อความกฎ
                const ruleDescText = scene.add.text(arrowX + 80, arrowY - 10 + (index * ruleSpacingY), transformRule, {
                    fontSize: '24px', color: '#666', fontFamily: 'Kanit, Arial'
                }).setOrigin(0, 0.5);
                scene.problemElements.push(ruleDescText);
            });

            // ✅ สร้างพื้นที่เป้าหมายสำหรับวางผลลัพธ์ที่คาดการณ์ (Target Drop Zone)
            const targetX = config.scale.width - 200; // ตำแหน่งขวาบน
            const targetY = initialObjY;
            const targetSize = 120; // ขนาดพื้นที่เป้าหมาย
            const targetOutline = scene.add.graphics().lineStyle(4, 0x1e3a8a).strokeRect(targetX - targetSize / 2, targetY - targetSize / 2, targetSize, targetSize);
            targetOutline.setDepth(-1); // ให้อยู่ด้านหลัง
            targetDropZone = scene.add.zone(targetX, targetY, targetSize, targetSize).setRectangleDropZone(targetSize, targetSize);
            targetDropZone.setData({ type: "target_area", isFilled: false });
            scene.problemElements.push(targetOutline, targetDropZone);


            // ✅ แสดงตัวเลือกผลลัพธ์ (Draggable Options)
            const optionSize = 100;
            const optionPadding = 40;
            const totalOptionsWidth = (problem.options.length * optionSize) + ((problem.options.length - 1) * optionPadding);
            const optionsStartX = (config.scale.width - totalOptionsWidth) / 2 + optionSize / 2;
            const optionsY = 450; // ตำแหน่ง Y สำหรับตัวเลือก

            draggableOptions = []; // รีเซ็ต array
            problem.options.forEach((optionKey, index) => {
                const x = optionsStartX + index * (optionSize + optionPadding);
                const optionImage = scene.add.image(x, optionsY, optionKey)
                    .setDisplaySize(optionSize, optionSize)
                    .setInteractive({ useHandCursor: true });

                optionImage.setData('originalX', x);
                optionImage.setData('originalY', optionsY);
                optionImage.setData('itemType', optionKey); // เก็บประเภทของ item ที่ลากได้

                scene.input.setDraggable(optionImage);
                scene.problemElements.push(optionImage);
                draggableOptions.push(optionImage);
            });

            console.log("Problem rendered. All elements created.");
        }


        // Helper function (เหมือนเดิม)
        function getBlankIndex(problemData, patternIndex) {
            let blankCount = -1;
            for (let i = 0; i <= patternIndex; i++) {
                if (problemData.sequence[i] === "?") {
                    blankCount++;
                }
            }
            return blankCount;
        }

        // ✅ ฟังก์ชันตรวจสอบความสำเร็จของปัญหาปัจจุบัน (เมื่อเลือกผลลัพธ์ถูกต้อง)
        function checkProblemCompletion(scene) {
            // ปัญหาปัจจุบันสำเร็จเมื่อมีภาพวางใน targetDropZone และถูกต้อง
            if (targetDropZone.getData('isFilled')) { // ถูกตั้งเป็น true เมื่อวางถูก
                solvedProblems++;
                console.log(`Problem ${currentProblemIndex + 1} solved! Total solved problems: ${solvedProblems} out of ${problems.length}`);

                scene.time.delayedCall(1000, () => {
                    currentProblemIndex++;
                    if (currentProblemIndex < problems.length) {
                        renderProblem(scene, problems[currentProblemIndex]);
                    } else {
                        onStageComplete(scene);
                    }
                });
            }
        }

        // ✅ Override scene.input.on('drop') for this stage
        scene.input.on('drop', (pointer, gameObject, dropZone) => {
            gameObject.clearTint();

            // ตรวจสอบว่าเป็น Drop Zone เป้าหมาย และยังว่างอยู่
            const isTargetDropZone = dropZone.getData('type') === 'target_area' && !dropZone.getData('isFilled');

            // ตรวจสอบว่าภาพผลลัพธ์ที่ลากมา (gameObject) ถูกต้องตามคำตอบที่ถูกต้องของปัญหาปัจจุบันหรือไม่
            if (isTargetDropZone && gameObject.getData('itemType') === problems[currentProblemIndex].correctAnswer) {
                scene.sound.play('correct');
                gameObject.disableInteractive(); // ปิดการโต้ตอบของตัวเลือกที่วางถูกแล้ว

                // ย้ายภาพไปที่ตำแหน่งกลางของ Target Drop Zone
                scene.tweens.add({
                    targets: gameObject,
                    x: dropZone.x, y: dropZone.y,
                    scale: 1, // ขนาดปกติ
                    duration: 200, ease: 'Power2'
                });

                dropZone.setData('isFilled', true); // ตั้งค่าว่าช่องถูกเติมแล้ว

                checkProblemCompletion(scene); // ตรวจสอบว่าปัญหาปัจจุบันถูกแก้ครบแล้วหรือยัง
            } else { // กรณีตอบผิด
                scene.sound.play('wrong');
                scene.cameras.main.shake(150, 0.005); // กล้องสั่น
                attempts++;

                const originalX = gameObject.getData('originalX');
                const originalY = gameObject.getData('originalY');

                // แอนิเมชัน "สั่น" อย่างเดียว ภาพคงเดิม
                scene.tweens.add({
                    targets: gameObject,
                    x: originalX + 5,
                    yoyo: true,
                    repeat: 2,
                    duration: 50,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        gameObject.setPosition(originalX, originalY);
                        gameObject.setScale(1);
                        console.log("Tween complete (Shake). Final position:", gameObject.x, gameObject.y, "Final scale:", gameObject.scaleX);
                    }
                });
            }
        });

        // ✅ ฟังก์ชันเมื่อด่านสำเร็จ
        // File: assets/js/logic_game/stage9.js (เฉพาะส่วนของฟังก์ชัน onStageComplete)
        // แก้ไข: Uncaught ReferenceError: scene is not defined

        // File: assets/js/logic_game/stage9.js (เฉพาะส่วนของฟังก์ชัน onStageComplete)
        // แก้ไข: Uncaught ReferenceError: scene is not defined (ยืนยันและ Debug)

        // File: assets/js/logic_game/stage9.js (เฉพาะส่วนของฟังก์ชัน onStageComplete)
        // แก้ไข: Uncaught ReferenceError: scene is not defined (ยืนยันและ Debug)

        function onStageComplete(scene_param) { // ✅ เปลี่ยนชื่อ parameter เป็น scene_param เพื่อความชัดเจนในการ Debug
            console.log("Stage 9: onStageComplete called.");
            console.log("DEBUG: onStageComplete - scene_param type:", typeof scene_param, "scene_param value:", scene_param); // Debug: ตรวจสอบ scene param

            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts;
            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 90) { starsEarned = 3; } // ปรับเวลาให้เหมาะกับความยากด่าน 9
                else { starsEarned = 2; }
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length * 2) {
                if (durationSeconds <= 120) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0;
            }

            console.log("Stage 9 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

            scene_param.time.delayedCall(800, () => { // ✅ ใช้ scene_param ใน delayedCall
                console.log("DEBUG: inside delayedCall - scene_param type:", typeof scene_param, "scene_param value:", scene_param); // Debug: ตรวจสอบ scene param ภายใน

                if (scene_param.problemElements) { // ✅ ใช้ scene_param
                    scene_param.problemElements.forEach(el => el.destroy());
                }

                const container = scene_param.add.container(config.scale.width / 2, config.scale.height / 2); // ✅ ใช้ scene_param
                container.setDepth(10);
                container.setAlpha(0);
                container.setScale(0.7);

                const rect = scene_param.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive(); // ✅ ใช้ scene_param
                container.add(rect);

                const winText = scene_param.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 9 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); // ✅ ใช้ scene_param
                container.add(winText);

                const scoreText = scene_param.add.text(0, 20, `ได้รับ ${starsEarned} ดาว!`, { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5); // ✅ ใช้ scene_param
                container.add(scoreText);

                scene_param.tweens.add({ // ✅ ใช้ scene_param
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