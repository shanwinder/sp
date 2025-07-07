// File: assets/js/logic_game/stage4.js
// ด่าน 4: แบบรูปเรขาคณิต (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// แก้ไข: Uncaught ReferenceError: maxUsableWidth is not defined (ยืนยันการประกาศตัวแปร)

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

        // ✅ สำคัญ: ประกาศตัวแปรเหล่านี้ที่นี่ (Global scope ของเกม) ✅
        let startTime;     // เวลาเริ่มต้นเล่นด่าน
        let attempts = 0;  // จำนวนครั้งที่พยายามตอบผิด
        let currentProblemIndex = 0; // ดัชนีของปัญหาปัจจุบันใน array 'problems'
        let solvedProblems = 0; // นับจำนวนปัญหาย่อยที่แก้ได้

        // ข้อมูลปัญหา: แบบรูป, คำตอบที่ถูกต้อง, ตัวเลือก (เพิ่มความยาก)
        const problems = [
            { // ปัญหาที่ 1: ลำดับ A-B-A-?
                sequence: ["circle", "triangle", "circle", "?"], 
                missingIndices: [3], // ตำแหน่งของ '?'
                options: Phaser.Utils.Array.Shuffle(["triangle", "square", "circle", "triangle"]), // ทำให้มี 4 ตัวเลือก
                correctAnswers: ["triangle"] // คำตอบที่ถูกต้องตามลำดับ missingIndices
            },
            { // ปัญหาที่ 2: ลำดับ A-A-B-B-?
                sequence: ["square", "square", "triangle", "triangle", "?"], 
                missingIndices: [4],
                options: Phaser.Utils.Array.Shuffle(["square", "triangle", "circle", "red_square"]), // ทำให้มี 4 ตัวเลือก
                correctAnswers: ["square"]
            },
            { // ปัญหาที่ 3: ลำดับ A-B-C-A-?-C (ยาวขึ้น มี 1 ช่องว่าง)
                sequence: ["circle", "triangle", "square", "circle", "?", "square"], 
                missingIndices: [4],
                options: Phaser.Utils.Array.Shuffle(["triangle", "square", "circle", "blue_triangle"]), // ทำให้มี 4 ตัวเลือก
                correctAnswers: ["triangle"]
            },
            { // ปัญหาที่ 4: ลำดับยาวขึ้น และมี 2 ช่องว่าง (7 ภาพ)
                sequence: ["triangle", "square", "circle", "triangle", "?", "circle", "?"], 
                missingIndices: [4, 6],
                options: Phaser.Utils.Array.Shuffle(["square", "circle", "triangle", "red_square"]), // มี 4 ตัวเลือกอยู่แล้ว
                correctAnswers: ["square", "triangle"]
            }
        ];
        
        let dropZones = []; // จะเก็บ Drop Zone ของปัญหาปัจจุบัน

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            console.log("Stage 4: Preload started.");
            this.load.image("circle", "../assets/img/circle.webp");
            this.load.image("triangle", "../assets/img/triangle.webp");
            this.load.image("square", "../assets/img/square.webp");
            this.load.image("red_square", "../assets/img/red_square.webp"); 
            this.load.image("blue_triangle", "../assets/img/blue_triangle.webp"); 

            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 4: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            console.log("Stage 4: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0; 
            currentProblemIndex = 0; // รีเซ็ตดัชนีปัญหาเมื่อเริ่ม create

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);
            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 4: Initial problem rendered.");

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

                const isCorrectDropZone = dropZone.getData('type') === 'blank' && !dropZone.getData('isFilled');
                
                if (isCorrectDropZone && gameObject.getData('value') === dropZone.getData('answer')) { 
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
                    
                    checkProblemCompletion(scene);
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


        function renderProblem(scene, problem) {
            console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);
            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = [];

            const titleText = scene.add.text(config.scale.width / 2, 80, `ปัญหาที่ ${currentProblemIndex + 1} จาก ${problems.length}`, { 
                fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial' 
            }).setOrigin(0.5);
            scene.problemElements.push(titleText);

            // ✅ สำคัญ: ประกาศตัวแปรเหล่านี้ภายในฟังก์ชัน renderProblem
            const maxUsablePatternWidth = config.scale.width - 100; // 900px - 100px (margin) = 800px usable width
            const minShapeSize = 50; // ขนาดรูปทรงขั้นต่ำสุด
            const minPadding = 5;   // ระยะห่างขั้นต่ำสุด

            let currentShapeSize = 100; // ขนาดเริ่มต้นที่ต้องการ
            let currentShapePadding = 40; // ระยะห่างเริ่มต้นที่ต้องการ

            const numItems = problem.sequence.length;

            console.log("--- Layout Debug for Problem " + (currentProblemIndex + 1) + " ---");
            console.log("maxUsablePatternWidth:", maxUsablePatternWidth);
            console.log("numItems:", numItems);
            console.log("Initial shapeSize:", currentShapeSize, "padding:", currentShapePadding);

            if (numItems > 0) {
                let requiredWidth = (numItems * currentShapeSize) + ((numItems - 1) * currentShapePadding);

                if (requiredWidth > maxUsablePatternWidth) {
                    const scaleFactor = maxUsablePatternWidth / requiredWidth;
                    
                    currentShapeSize = Math.max(minShapeSize, Math.floor(currentShapeSize * scaleFactor));
                    currentShapePadding = Math.max(minPadding, Math.floor(currentShapePadding * scaleFactor));
                    
                    requiredWidth = (numItems * currentShapeSize) + ((numItems - 1) * currentShapePadding);
                    if (requiredWidth < maxUsablePatternWidth && numItems > 1) { 
                         const remainingSpace = maxUsablePatternWidth - requiredWidth;
                         currentShapePadding += Math.floor(remainingSpace / (numItems - 1));
                         currentShapePadding = Math.max(minPadding, currentShapePadding);
                    }
                }
            } else { 
                currentShapeSize = 100;
                currentShapePadding = 40;
            }

            const finalPatternWidth = (numItems * currentShapeSize) + ((numItems - 1) * currentShapePadding);
            const patternStartX = (config.scale.width - finalPatternWidth) / 2 + currentShapeSize / 2;
            const patternY = 220;

            console.log("Final shapeSize:", currentShapeSize, "Final padding:", currentShapePadding);
            console.log("Final totalPatternWidth:", finalPatternWidth);
            console.log("Pattern Start X:", patternStartX);
            console.log("Max Usable Width (Target):", maxUsablePatternWidth);
            console.log("--- End Layout Debug ---");


            dropZones = []; 

            problem.sequence.forEach((shapeKey, index) => {
                const x = patternStartX + index * (currentShapeSize + currentShapePadding);
                if (shapeKey === "?") {
                    const outline = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - currentShapeSize / 2, patternY - currentShapeSize / 2, currentShapeSize, currentShapeSize);
                    const dropZone = scene.add.zone(x, patternY, currentShapeSize, currentShapeSize).setRectangleDropZone(currentShapeSize, currentShapeSize); 
                    dropZone.setData({ 
                        type: "blank", 
                        index: index, 
                        isFilled: false, 
                        answer: problem.correctAnswers[getBlankIndex(problem, index)], 
                        outline: outline 
                    }); 
                    scene.problemElements.push(outline, dropZone); 
                    dropZones.push(dropZone); 
                } else {
                    const shapeImage = scene.add.image(x, patternY, shapeKey).setDisplaySize(currentShapeSize, currentShapeSize); 
                    console.log(`Created pattern shape "${shapeKey}": displaySize(${shapeImage.displayWidth}, ${shapeImage.displayHeight}), scale(${shapeImage.scaleX}, ${shapeImage.scaleY})`);
                    scene.problemElements.push(shapeImage);
                }
            });

            const choiceSize = currentShapeSize; 
            const choicePadding = currentShapePadding; 
            const totalChoicesWidth = (problem.options.length * choiceSize) + ((problem.options.length - 1) * choicePadding);
            const choicesStartX = (config.scale.width - totalChoicesWidth) / 2 + choiceSize / 2;
            const choicesY = 450;

            problem.options.forEach((choiceKey, index) => {
                const x = choicesStartX + index * (choiceSize + choicePadding);
                const choiceImage = scene.add.image(x, choicesY, choiceKey)
                                        .setDisplaySize(choiceSize, choiceSize) 
                                        .setInteractive({ useHandCursor: true });
                                        
                choiceImage.setData('originalX', x);
                choiceImage.setData('originalY', choicesY);

                console.log(`Created choice "${choiceKey}": displaySize(${choiceImage.displayWidth}, ${choiceImage.displayHeight}), scale(${choiceImage.scaleX}, ${choiceImage.scaleY})`);
                                        
                choiceImage.setData({ type: "draggable", value: choiceKey });
                scene.input.setDraggable(choiceImage);
                scene.problemElements.push(choiceImage);
            });
            console.log("Problem rendered. All choices created.");
        }


        function getBlankIndex(problemData, patternIndex) { 
            let blankCount = -1;
            for (let i = 0; i <= patternIndex; i++) {
                if (problemData.sequence[i] === "?") {
                    blankCount++;
                }
            }
            return blankCount;
        }


        function checkProblemCompletion(scene) {
            const allBlanksInCurrentPatternFilled = dropZones.every(zone => zone.getData('isFilled'));

            if (allBlanksInCurrentPatternFilled) {
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


        function onStageComplete(scene) {
            console.log("Stage 4: onStageComplete called.");
            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts;
            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 60) { starsEarned = 3; }
                else { starsEarned = 2; }
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length * 2) {
                if (durationSeconds <= 90) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0; 
            }

            console.log("Stage 4 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

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