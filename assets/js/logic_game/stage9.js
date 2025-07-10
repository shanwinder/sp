// File: assets/js/logic_game/stage9.js
// ด่าน 9: วัตถุเปลี่ยนรูป (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ✅ รูปแบบ: Drag & Drop คาดการณ์ผลลัพธ์การเปลี่ยนแปลงวัตถุ
// ✅ ปรับปรุง: ใช้ภาษาอังกฤษง่ายๆ ในเกม, และแก้ไขปัญหาอื่นๆ

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // ✅ สำคัญ: รอให้ฟอนต์ Kanit โหลดเสร็จก่อนสร้างเกม Phaser
        document.fonts.ready.then(function() {
            console.log("Web Fonts ready for Stage 9. Initializing Phaser game.");

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
                    rule: "Blue Square: 1.Change to Red 2.Rotate 90 degrees", // ✅ กฎเป็นภาษาอังกฤษ
                    initialObject: "blue_square", 
                    transformations: ["Change Color: Red", "Rotate: 90°"], // ✅ คำอธิบายกฎเป็นภาษาอังกฤษ
                    correctAnswer: "red_square_rotated_90", 
                    options: Phaser.Utils.Array.Shuffle(["red_square_rotated_90", "red_square_normal", "blue_square_rotated_90", "green_square_normal"])
                },
                { // ปัญหาที่ 2: ขยายและเปลี่ยนรูปทรง
                    rule: "Green Circle: 1.Scale 2X 2.Change to Triangle", // ✅ กฎเป็นภาษาอังกฤษ
                    initialObject: "green_circle",
                    transformations: ["Scale: 2X", "Shape: Triangle"], // ✅ คำอธิบายกฎเป็นภาษาอังกฤษ
                    correctAnswer: "green_triangle_large",
                    options: Phaser.Utils.Array.Shuffle(["green_triangle_large", "green_circle_large", "blue_triangle_large", "red_triangle_large"])
                },
                { // ปัญหาที่ 3: สะท้อนและเปลี่ยนสี
                    rule: "Red Triangle: 1.Flip Horizontal 2.Change to Blue", // ✅ กฎเป็นภาษาอังกฤษ
                    initialObject: "red_triangle",
                    transformations: ["Flip: Horizontal", "Change Color: Blue"], // ✅ คำอธิบายกฎเป็นภาษาอังกฤษ
                    correctAnswer: "blue_triangle_flipped",
                    options: Phaser.Utils.Array.Shuffle(["blue_triangle_flipped", "red_triangle_normal", "blue_triangle_normal", "green_triangle_flipped"])
                }
            ];
            
            let targetDropZone; // พื้นที่เป้าหมายสำหรับวางผลลัพธ์
            let draggableOptions = []; // Array เก็บตัวเลือกที่ลากได้

            // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
            function preload() {
                console.log("Stage 9: Preload started.");
                // โหลดภาพวัตถุเริ่มต้นและภาพผลลัพธ์การแปลงต่างๆ (ต้องเตรียม Asset เหล่านี้)
                this.load.image("blue_square", "../assets/img/objects/blue_square.webp");
                this.load.image("red_square_rotated_90", "../assets/img/objects/red_square_rotated_90.webp");
                this.load.image("red_square_normal", "../assets/img/objects/red_square_normal.webp"); 
                this.load.image("blue_square_rotated_90", "../assets/img/objects/blue_square_rotated_90.webp"); 
                this.load.image("green_square_normal", "../assets/img/objects/green_square_normal.webp"); 

                this.load.image("green_circle", "../assets/img/objects/green_circle.webp");
                this.load.image("green_triangle_large", "../assets/img/objects/green_triangle_large.webp"); 
                this.load.image("green_circle_large", "../assets/img/objects/green_circle_large.webp"); 
                this.load.image("blue_triangle_large", "../assets/img/objects/blue_triangle_large.webp"); 
                this.load.image("red_triangle_large", "../assets/img/objects/red_triangle_large.webp"); 

                this.load.image("red_triangle", "../assets/img/objects/red_triangle.webp");
                this.load.image("blue_triangle_flipped", "../assets/img/objects/blue_triangle_flipped.webp"); 
                this.load.image("red_triangle_normal", "../assets/img/objects/red_triangle_normal.webp"); 
                this.load.image("blue_triangle_normal", "../assets/img/objects/blue_triangle_normal.webp"); 
                this.load.image("green_triangle_flipped", "../assets/img/objects/green_triangle_flipped.webp"); 

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
                graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
                graphics.fillRect(0, 0, config.scale.width, config.scale.height);
                graphics.setDepth(-2);
                
                const problemZoneBg = scene.add.graphics();
                problemZoneBg.fillStyle(0xFFFFF0, 0.9)
                            .lineStyle(3, 0xFFA000);
                problemZoneBg.strokeRoundedRect(25, 25, 850, 300, 20);
                problemZoneBg.fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);
                
                const choicesZoneBg = scene.add.graphics();
                choicesZoneBg.fillStyle(0xF0F8FF, 0.9)
                            .lineStyle(3, 0x4682B4);
                choicesZoneBg.strokeRoundedRect(25, 350, 850, 225, 20);
                choicesZoneBg.fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);

                renderProblem(scene, problems[currentProblemIndex]);
                console.log("Stage 9: Initial problem rendered.");

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

                    const isTargetDropZone = dropZone.getData('type') === 'target_area' && !dropZone.getData('isFilled');
                    
                    if (isTargetDropZone && gameObject.getData('itemType') === problems[currentProblemIndex].correctAnswer) { 
                        scene.sound.play('correct');
                        gameObject.disableInteractive(); 
                        
                        scene.tweens.add({
                            targets: gameObject,
                            x: dropZone.x, y: dropZone.y, 
                            scale: 1, 
                            duration: 200, ease: 'Power2'
                        });
                        
                        dropZone.setData('isFilled', true); 
                        
                        checkProblemCompletion(scene); 
                    } else { 
                        scene.sound.play('wrong');
                        scene.cameras.main.shake(150, 0.005); 
                        attempts++;

                        const originalX = gameObject.getData('originalX'); 
                        const originalY = gameObject.getData('originalY'); 

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
                    if (!dropped) { 
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
            function renderProblem(scene_param, problem) { // ✅ เปลี่ยนชื่อเป็น scene_param
                console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);
                if (!problem || !problem.initialObject || !Array.isArray(problem.transformations) || !Array.isArray(problem.options)) {
                    console.error("Critical Error: problem data is invalid/incomplete in renderProblem. Cannot render stage.", problem);
                    return; 
                }

                if (scene_param.problemElements) { // ✅ ใช้ scene_param
                    scene_param.problemElements.forEach(el => el.destroy()); // ✅ ใช้ scene_param
                }
                scene_param.problemElements = []; // ✅ ใช้ scene_param

                // ✅ แสดงกฎการเปลี่ยนแปลง (Rule)
                const ruleText = scene_param.add.text(config.scale.width / 2, 60, `Rule: ${problem.rule}`, { // ✅ เปลี่ยนเป็นภาษาอังกฤษ
                    fontSize: '28px', color: '#1e3a8a', fontFamily: 'Kanit, Arial', align: 'center', wordWrap: { width: 800 }
                }).setOrigin(0.5);
                scene_param.problemElements.push(ruleText);

                // ✅ แสดงวัตถุเริ่มต้น (Initial Object)
                const initialObjSize = 120;
                const initialObjX = 200;
                const initialObjY = 200;
                const initialObjectImage = scene_param.add.image(initialObjX, initialObjY, problem.initialObject) // ✅ ใช้ scene_param
                                                    .setDisplaySize(initialObjSize, initialObjSize);
                scene_param.problemElements.push(initialObjectImage);

                // ✅ แสดงลูกศรและกฎการเปลี่ยนแปลง
                const arrowX = initialObjX + initialObjSize / 2 + 50; 
                const arrowY = initialObjY;
                const ruleSpacingY = 40; 

                problem.transformations.forEach((transformRule, index) => {
                    const arrowGraphics = scene_param.add.graphics(); // ✅ ใช้ scene_param
                    arrowGraphics.lineStyle(3, 0x888888);
                    arrowGraphics.lineBetween(arrowX, arrowY - 10 + (index * ruleSpacingY), arrowX + 50, arrowY - 10 + (index * ruleSpacingY));
                    arrowGraphics.lineBetween(arrowX + 50, arrowY - 10 + (index * ruleSpacingY), arrowX + 40, arrowY - 15 + (index * ruleSpacingY));
                    arrowGraphics.lineBetween(arrowX + 50, arrowY - 10 + (index * ruleSpacingY), arrowX + 40, arrowY - 5 + (index * ruleSpacingY));
                    scene_param.problemElements.push(arrowGraphics); // ✅ ใช้ scene_param

                    const ruleDescText = scene_param.add.text(arrowX + 80, arrowY - 10 + (index * ruleSpacingY), transformRule, { // ✅ ใช้ scene_param, ข้อความเป็นภาษาอังกฤษ
                        fontSize: '24px', color: '#666', fontFamily: 'Kanit, Arial'
                    }).setOrigin(0, 0.5);
                    scene_param.problemElements.push(ruleDescText); // ✅ ใช้ scene_param
                });

                // ✅ สร้างพื้นที่เป้าหมายสำหรับวางผลลัพธ์ที่คาดการณ์ (Target Drop Zone)
                const targetX = config.scale.width - 200; 
                const targetY = initialObjY;
                const targetSize = 120; 
                const targetOutline = scene_param.add.graphics().lineStyle(4, 0x1e3a8a).strokeRect(targetX - targetSize / 2, targetY - targetSize / 2, targetSize, targetSize); // ✅ ใช้ scene_param
                targetOutline.setDepth(-1); 
                targetDropZone = scene_param.add.zone(targetX, targetY, targetSize, targetSize).setRectangleDropZone(targetSize, targetSize); // ✅ ใช้ scene_param
                targetDropZone.setData({ type: "target_area", isFilled: false });
                scene_param.problemElements.push(targetOutline, targetDropZone); // ✅ ใช้ scene_param


                // ✅ แสดงตัวเลือกผลลัพธ์ (Draggable Options)
                const optionSize = 100;
                const optionPadding = 40;
                const totalOptionsWidth = (problem.options.length * optionSize) + ((problem.options.length - 1) * optionPadding);
                const optionsStartX = (config.scale.width - totalOptionsWidth) / 2 + optionSize / 2;
                const optionsY = 450; 

                draggableOptions = []; 
                problem.options.forEach((optionKey, index) => {
                    const x = optionsStartX + index * (optionSize + optionPadding);
                    const optionImage = scene_param.add.image(x, optionsY, optionKey) // ✅ ใช้ scene_param
                                            .setDisplaySize(optionSize, optionSize)
                                            .setInteractive({ useHandCursor: true });
                    
                    optionImage.setData('originalX', x);
                    optionImage.setData('originalY', optionsY);
                    optionImage.setData('itemType', optionKey); 

                    scene_param.input.setDraggable(optionImage); // ✅ ใช้ scene_param
                    scene_param.problemElements.push(optionImage); // ✅ ใช้ scene_param
                    draggableOptions.push(optionImage);
                });
                console.log("Problem rendered. All elements created.");
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


            function checkProblemCompletion(scene_param) { // ✅ ใช้ scene_param
                // ปัญหาปัจจุบันสำเร็จเมื่อมีภาพวางใน targetDropZone และถูกต้อง
                if (targetDropZone.getData('isFilled')) { 
                    solvedProblems++;
                    console.log(`Problem ${currentProblemIndex + 1} solved! Total solved problems: ${solvedProblems} out of ${problems.length}`);

                    scene_param.time.delayedCall(1000, () => { // ✅ ใช้ scene_param
                        currentProblemIndex++;
                        if (currentProblemIndex < problems.length) {
                            renderProblem(scene_param, problems[currentProblemIndex]); // ✅ ใช้ scene_param
                        } else {
                            onStageComplete(scene_param); // ✅ ใช้ scene_param
                        }
                    });
                }
            }

            // ✅ ฟังก์ชันเมื่อด่านสำเร็จ
            function onStageComplete(scene_param) { // ✅ ใช้ scene_param
                console.log("Stage 9: onStageComplete called.");
                console.log("DEBUG: onStageComplete - scene_param type:", typeof scene_param, "scene_param value:", scene_param);
                
                const endTime = Date.now();
                const durationSeconds = Math.floor((endTime - startTime) / 1000);
                let starsEarned = 0;

                const finalAttempts = attempts;
                if (solvedProblems === problems.length && finalAttempts === 0) {
                    if (durationSeconds <= 90) { starsEarned = 3; }
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

                scene_param.time.delayedCall(800, () => { // ✅ ใช้ scene_param
                    console.log("DEBUG: inside delayedCall - scene_param type:", typeof scene_param, "scene_param value:", scene_param);
                    
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

                    const scoreText = scene_param.add.text(0, 20, `ได้รับ ${starsEarned} ดาว!`, { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5); // ✅ ใช้ scene_param
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

        }); // End document.fonts.ready.then
    })(); // End IIFE