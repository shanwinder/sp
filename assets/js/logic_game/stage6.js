// File: assets/js/logic_game/stage6.js
// ด่าน 6: แบบรูปตัวอักษร (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ปรับปรุง: แก้ไข Font Rendering (วรรณยุกต์ซ้อน) ใน Phaser.js ด้วยการทดลอง lineSpacing และ stroke

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
        let solvedProblems = 0;

        const problems = [
            { // ปัญหาที่ 1
                sequence: ["A", "B", "A", "?"], 
                missingIndices: [3], 
                options: Phaser.Utils.Array.Shuffle(["B", "C", "D", "E"]), 
                correctAnswers: ["B"]
            },
            { // ปัญหาที่ 2
                sequence: ["X", "X", "Y", "Y", "?"], 
                missingIndices: [4],
                options: Phaser.Utils.Array.Shuffle(["Z", "W", "X", "Y"]),
                correctAnswers: ["Z"]
            },
            { // ปัญหาที่ 3
                sequence: ["D", "E", "F", "D", "?", "F"], 
                missingIndices: [4],
                options: Phaser.Utils.Array.Shuffle(["E", "G", "H", "I"]),
                correctAnswers: ["E"]
            },
            { // ปัญหาที่ 4
                sequence: ["A", "C", "E", "?"], 
                missingIndices: [3],
                options: Phaser.Utils.Array.Shuffle(["F", "G", "H", "I"]),
                correctAnswers: ["G"] 
            },
            { // ปัญหาที่ 5 (ปรับแก้): ลำดับยาวขึ้น และมี 2 ช่องว่าง
                sequence: ["A", "B", "C", "?", "A", "?", "C"], 
                missingIndices: [3, 5], 
                options: Phaser.Utils.Array.Shuffle(["B", "D", "E", "F"]), 
                correctAnswers: ["B", "E"] 
            }
        ];
        
        let dropZones = [];

        function preload() {
            console.log("Stage 6: Preload started.");
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 6: Assets loaded.");
        }

        function create() {
            console.log("Stage 6: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0; 
            currentProblemIndex = 0; 

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1); // พื้นที่โจทย์
            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1); // พื้นที่ตัวเลือก

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 6: Initial problem rendered.");

            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                gameObject.setTint(0xfff7d6);
                gameObject.setScale(1.15); // ขยายเล็กน้อยตอนเริ่มลาก
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
                        scale: 1, // กลับมาขนาดปกติ
                        duration: 200, ease: 'Power2'
                    });
                    
                    dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100);
                    dropZone.setData('isFilled', true);
                    
                    checkProblemCompletion(scene);
                } else { // กรณีตอบผิด
                    scene.sound.play('wrong');
                    scene.cameras.main.shake(150, 0.005); // กล้องสั่น
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
                        scale: 1, // กลับไปขนาดเดิม
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }


        function renderProblem(scene, problem) {
            console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);
            if (!problem || !Array.isArray(problem.sequence)) {
                console.error("Critical Error: problemData or problemData.sequence is invalid/undefined in renderProblem. Cannot render stage.", problem);
                return; 
            }

            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = [];

            const titleText = scene.add.text(config.scale.width / 2, 80, `ปัญหาที่ ${currentProblemIndex + 1} จาก ${problems.length}`, { 
                fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial', lineSpacing: 0 // ✅ lineSpacing
            }).setOrigin(0.5);
            scene.problemElements.push(titleText);

            const maxUsablePatternWidth = config.scale.width - 100;
            const minCharSize = 50; 
            const minPadding = 5;   

            let currentCharSize = 80; 
            let currentCharPadding = 30; 

            const numItems = problem.sequence.length;

            if (numItems > 0) {
                let requiredWidth = (numItems * currentCharSize) + ((numItems - 1) * currentCharPadding);

                if (requiredWidth > maxUsablePatternWidth) {
                    const scaleFactor = maxUsablePatternWidth / requiredWidth;
                    
                    currentCharSize = Math.max(minCharSize, Math.floor(currentCharSize * scaleFactor));
                    currentCharPadding = Math.max(minPadding, Math.floor(currentCharPadding * scaleFactor));
                    
                    requiredWidth = (numItems * currentCharSize) + ((numItems - 1) * currentCharPadding);
                    if (requiredWidth < maxUsablePatternWidth && numItems > 1) { 
                         const remainingSpace = maxUsablePatternWidth - requiredWidth;
                         currentCharPadding += Math.floor(remainingSpace / (numItems - 1));
                         currentCharPadding = Math.max(minPadding, currentCharPadding);
                    }
                }
            } else { 
                currentCharSize = 80;
                currentCharPadding = 30;
            }

            const finalPatternWidth = (numItems * currentCharSize) + ((numItems - 1) * currentCharPadding);
            const patternStartX = (config.scale.width - finalPatternWidth) / 2 + currentCharSize / 2;
            const patternY = 220;

            dropZones = []; 

            problem.sequence.forEach((charKey, index) => {
                const x = patternStartX + index * (currentCharSize + currentCharPadding);
                if (charKey === "?") {
                    const outline = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - currentCharSize / 2, patternY - currentCharSize / 2, currentCharSize, currentCharSize);
                    const dropZone = scene.add.zone(x, patternY, currentCharSize, currentCharSize).setRectangleDropZone(currentCharSize, currentCharSize); 
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
                    const charText = scene.add.text(x, patternY, charKey, { 
                        fontSize: `${currentCharSize * 0.8}px`, 
                        color: '#0c4a6e', 
                        fontFamily: 'Kanit, Arial',
                        lineSpacing: -10 // ✅ lineSpacing (ค่าเดิมที่ลองแล้วยังไม่ได้ผล)
                        // ✅ ทดลองค่า lineSpacing อื่นๆ:
                        // lineSpacing: 0,   // ค่าเริ่มต้น
                        // lineSpacing: 5,   // ลองค่าบวกเล็กน้อย
                        // lineSpacing: -5,  // ลองค่าลบเล็กน้อย
                        // lineSpacing: -15, // ลองค่าลบที่มากขึ้น
                        // ✅ เพิ่ม stroke เพื่อดูขอบเขตของข้อความ (สำหรับ Debug)
                        // stroke: '#ff00ff', // สีม่วง
                        // strokeThickness: 2 
                    }).setOrigin(0.5);
                    console.log(`Created pattern char "${charKey}": fontSize(${charText.style.fontSize}), scale(${charText.scaleX}, ${charText.scaleY}), height: ${charText.height}`); // เพิ่ม height log
                    scene.problemElements.push(charText);
                }
            });

            const choiceSize = currentCharSize; 
            const choicePadding = currentCharPadding; 
            const totalChoicesWidth = (problem.options.length * choiceSize) + ((problem.options.length - 1) * choicePadding);
            const choicesStartX = (config.scale.width - totalChoicesWidth) / 2 + choiceSize / 2;
            const choicesY = 450;

            problem.options.forEach((choiceKey, index) => {
                const x = choicesStartX + index * (choiceSize + choicePadding);
                const choiceText = scene.add.text(x, choicesY, choiceKey, { 
                                        fontSize: `${choiceSize * 0.8}px`, 
                                        color: '#0c4a6e', 
                                        fontFamily: 'Kanit, Arial',
                                        lineSpacing: -10 // ✅ lineSpacing
                                        // ✅ เพิ่ม stroke เพื่อดูขอบเขตของข้อความ (สำหรับ Debug)
                                        // stroke: '#ff00ff', 
                                        // strokeThickness: 2 
                                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                                        
                choiceText.setData('originalX', x);
                choiceText.setData('originalY', choicesY);

                console.log(`Created choice "${choiceKey}": fontSize(${choiceText.style.fontSize}), scale(${choiceText.scaleX}, ${choiceText.scaleY}), height: ${choiceText.height}`); // เพิ่ม height log
                                        
                choiceText.setData({ type: "draggable", value: choiceKey });
                scene.input.setDraggable(choiceText);
                scene.problemElements.push(choiceText);
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


        function onStageComplete(scene_param) { 
            console.log("Stage 6: onStageComplete called.");
            console.log("DEBUG: onStageComplete - scene_param type:", typeof scene_param, "scene_param value:", scene_param);
            
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

            console.log("Stage 6 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

            scene_param.time.delayedCall(800, () => { 
                console.log("DEBUG: inside delayedCall - scene_param type:", typeof scene_param, "scene_param value:", scene_param);
                
                if (scene_param.problemElements) { 
                    scene_param.problemElements.forEach(el => el.destroy());
                }

                const container = scene_param.add.container(config.scale.width / 2, config.scale.height / 2); 
                container.setDepth(10);
                container.setAlpha(0);
                container.setScale(0.7);

                const rect = scene_param.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive(); 
                container.add(rect);

                const winText = scene_param.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 6 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center', lineSpacing: 0 }).setOrigin(0.5); 
                container.add(winText);

                const scoreText = scene_param.add.text(0, 20, `ได้รับ ${starsEarned} ดาว!`, { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial', align: 'center', lineSpacing: 0 }).setOrigin(0.5); 
                container.add(scoreText);

                scene_param.tweens.add({ 
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