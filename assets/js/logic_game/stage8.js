// File: assets/js/logic_game/stage8.js
// ด่าน 8: สิ่งของใช้คู่กัน (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ✅ รูปแบบ: Drag & Drop จับคู่สิ่งของ

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
        let attempts = 0;  // จำนวนครั้งที่พยายามตอบผิด (จะนับเมื่อลากวางผิด)
        let solvedProblems = 0; // นับจำนวนปัญหาย่อยที่แก้ได้

        // ✅ ข้อมูลปัญหา: สิ่งของที่ต้องจับคู่ (staticItems เป็น Drop Zone), สิ่งของที่ลากได้ (draggableItems), การจับคู่ที่ถูกต้อง
        const problems = [
            { // ปัญหาที่ 1: คู่พื้นฐาน
                rule: "จับคู่สิ่งของที่ใช้คู่กันในชีวิตประจำวัน",
                staticItems: ["shoe", "pencil", "cup"], // เป็น Drop Zones
                draggableItems: ["sock", "eraser", "saucer", "book"], // มีตัวหลอก
                correctMapping: { 
                    "sock": "shoe",
                    "eraser": "pencil",
                    "saucer": "cup"
                },
                matchedCount: 0 // นับจำนวนคู่ที่จับถูกในปัญหานี้
            },
            { // ปัญหาที่ 2: คู่ในห้องน้ำ
                rule: "จับคู่ของใช้ในห้องน้ำ",
                staticItems: ["toothbrush", "shampoo", "soap"], 
                draggableItems: ["toothpaste", "conditioner", "sponge", "hair_dryer"], 
                correctMapping: {
                    "toothpaste": "toothbrush",
                    "conditioner": "shampoo",
                    "sponge": "soap"
                },
                matchedCount: 0
            },
            { // ปัญหาที่ 3: คู่ในครัว (ยากขึ้น มีตัวหลอกเยอะขึ้น)
                rule: "จับคู่ของใช้ในครัว",
                staticItems: ["knife", "fork", "plate"], 
                draggableItems: ["spoon", "chopsticks", "cutting_board", "whisk"], // มีตัวหลอก 2 ตัว
                correctMapping: {
                    "spoon": "fork",
                    "cutting_board": "knife",
                    "chopsticks": "plate" // หรือจะให้คู่กับ bowl ก็ได้ ถ้าจะซับซ้อนขึ้น
                },
                matchedCount: 0
            }
        ];
        
        let draggableItems = []; // Array เก็บสิ่งของที่ลากได้
        let staticItemZones = []; // Array เก็บ Drop Zone ของสิ่งของตั้งโต๊ะ

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            console.log("Stage 8: Preload started.");
            // ✅ โหลดภาพสิ่งของต่างๆ (คุณต้องเตรียมไฟล์ภาพเหล่านี้ไว้ในโฟลเดอร์ assets/img/items/)
            this.load.image("shoe", "../assets/img/items/shoe.webp");
            this.load.image("sock", "../assets/img/items/sock.webp");
            this.load.image("pencil", "../assets/img/items/pencil.webp");
            this.load.image("eraser", "../assets/img/items/eraser.webp");
            this.load.image("cup", "../assets/img/items/cup.webp");
            this.load.image("saucer", "../assets/img/items/saucer.webp");
            this.load.image("book", "../assets/img/items/book.webp"); // ตัวหลอก

            this.load.image("toothbrush", "../assets/img/items/toothbrush.webp");
            this.load.image("toothpaste", "../assets/img/items/toothpaste.webp");
            this.load.image("shampoo", "../assets/img/items/shampoo.webp");
            this.load.image("conditioner", "../assets/img/items/conditioner.webp");
            this.load.image("soap", "../assets/img/items/soap.webp");
            this.load.image("sponge", "../assets/img/items/sponge.webp");
            this.load.image("hair_dryer", "../assets/img/items/hair_dryer.webp"); // ตัวหลอก

            this.load.image("knife", "../assets/img/items/knife.webp");
            this.load.image("fork", "../assets/img/items/fork.webp");
            this.load.image("plate", "../assets/img/items/plate.webp");
            this.load.image("spoon", "../assets/img/items/spoon.webp");
            this.load.image("bowl", "../assets/img/items/bowl.webp");
            this.load.image("chopsticks", "../assets/img/items/chopsticks.webp");
            this.load.image("cutting_board", "../assets/img/items/cutting_board.webp"); // ตัวหลอก
            this.load.image("whisk", "../assets/img/items/whisk.webp"); // ตัวหลอก


            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 8: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            console.log("Stage 8: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0; 
            currentProblemIndex = 0; 

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1); // พื้นหลังไล่สี
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            // พื้นที่แสดงสิ่งของตั้งโต๊ะ (Drop Zones)
            const staticItemZoneBg = scene.add.graphics();
            staticItemZoneBg.fillStyle(0xFFFFF0, 0.9)
                        .lineStyle(3, 0xFFA000);
            staticItemZoneBg.strokeRoundedRect(25, 25, 850, 250, 20); // ปรับขนาด
            staticItemZoneBg.fillRoundedRect(25, 25, 850, 250, 20).setDepth(-1);
            
            // พื้นที่แสดงสิ่งของที่ลากได้ (Draggable Items)
            const draggableZoneBg = scene.add.graphics();
            draggableZoneBg.fillStyle(0xF0F8FF, 0.9)
                        .lineStyle(3, 0x4682B4);
            draggableZoneBg.strokeRoundedRect(25, 300, 850, 275, 20); // ปรับขนาด
            draggableZoneBg.fillRoundedRect(25, 300, 850, 275, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 8: Initial problem rendered.");

            // ✅ Event handlers สำหรับการลากและวาง (นำมาจาก stage7.js)
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

                // ตรวจสอบว่าเป็น Drop Zone ของ Static Item และไม่ได้ถูกจับคู่ไปแล้ว
                const isCorrectDropZone = dropZone.getData('type') === 'static_item' && !gameObject.getData('isMatched');
                
                // ตรวจสอบว่าสิ่งของที่ลาก (gameObject) คู่กับสิ่งของตั้งโต๊ะ (dropZone) ถูกต้องหรือไม่
                if (isCorrectDropZone && problems[currentProblemIndex].correctMapping[gameObject.getData('itemType')] === dropZone.getData('itemType')) { 
                    scene.sound.play('correct');
                    gameObject.disableInteractive(); // ปิดการโต้ตอบของสัตว์ที่จัดแล้ว
                    
                    // ย้ายสิ่งของที่ลากไปที่ตำแหน่งกลางของ Static Item
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y, 
                        scale: 0.8, // ย่อขนาดสัตว์เล็กน้อยเมื่ออยู่ใน Portal
                        duration: 200, ease: 'Power2'
                    });
                    
                    gameObject.setData('isMatched', true); // ตั้งค่าว่าสิ่งของตัวนี้ถูกจับคู่แล้ว
                    dropZone.setData('isPaired', true); // ตั้งค่าว่าสิ่งของตั้งโต๊ะถูกจับคู่แล้ว
                    problems[currentProblemIndex].matchedCount++; // นับจำนวนคู่ที่จับถูกในปัญหานี้
                    
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
            if (!problem || !Array.isArray(problem.staticItems) || !Array.isArray(problem.draggableItems)) { // ตรวจสอบข้อมูลปัญหา
                console.error("Critical Error: problem data is invalid/undefined in renderProblem. Cannot render stage.", problem);
                return; 
            }

            if (scene.problemElements) {
                scene.problemElements.forEach(el => el.destroy());
            }
            scene.problemElements = [];

            // ✅ แสดงกฎการจำแนก
            const ruleText = scene.add.text(config.scale.width / 2, 80, `กฎ: ${problem.rule}`, { 
                fontSize: '32px', color: '#1e3a8a', fontFamily: 'Kanit, Arial', align: 'center', wordWrap: { width: 800 }
            }).setOrigin(0.5);
            scene.problemElements.push(ruleText);

            // ✅ แสดงสิ่งของตั้งโต๊ะ (Static Items - Drop Zones)
            const itemSize = 100;
            const itemPadding = 60; // ปรับให้เหมาะกับ 3-4 ชิ้นต่อแถว
            const totalStaticItemsWidth = (problem.staticItems.length * itemSize) + ((problem.staticItems.length - 1) * itemPadding);
            const staticItemsStartX = (config.scale.width - totalStaticItemsWidth) / 2 + itemSize / 2;
            const staticItemsY = 200; // ตำแหน่ง Y สำหรับสิ่งของตั้งโต๊ะ

            staticItemZones = []; // รีเซ็ต array
            problem.staticItems.forEach((itemKey, index) => {
                const x = staticItemsStartX + index * (itemSize + itemPadding);
                const itemImage = scene.add.image(x, staticItemsY, itemKey)
                                        .setDisplaySize(itemSize, itemSize);
                
                // สร้าง Drop Zone บน Static Item
                const zone = scene.add.zone(x, staticItemsY, itemSize, itemSize).setRectangleDropZone(itemSize, itemSize);
                zone.setData({ type: "static_item", itemType: itemKey, isPaired: false }); // เก็บประเภทของ item และสถานะว่าถูกจับคู่แล้วหรือยัง

                scene.problemElements.push(itemImage, zone);
                staticItemZones.push(zone);
            });


            // ✅ แสดงสิ่งของที่ลากได้ (Draggable Items)
            const draggableSize = 100;
            const draggablePadding = 60;
            const totalDraggableItemsWidth = (problem.draggableItems.length * draggableSize) + ((problem.draggableItems.length - 1) * draggablePadding);
            const draggableItemsStartX = (config.scale.width - totalDraggableItemsWidth) / 2 + draggableSize / 2;
            const draggableItemsY = 440; // ตำแหน่ง Y สำหรับสิ่งของที่ลากได้

            draggableItems = []; // รีเซ็ต array
            problem.draggableItems.forEach((itemKey, index) => {
                const x = draggableItemsStartX + index * (draggableSize + draggablePadding);
                const draggableImage = scene.add.image(x, draggableItemsY, itemKey)
                                        .setDisplaySize(draggableSize, draggableSize)
                                        .setInteractive({ useHandCursor: true });
                
                draggableImage.setData('originalX', x);
                draggableImage.setData('originalY', draggableItemsY);
                draggableImage.setData('itemType', itemKey); // เก็บประเภทของ item ที่ลากได้
                draggableImage.setData('isMatched', false); // ยังไม่ถูกจับคู่

                scene.input.setDraggable(draggableImage);
                scene.problemElements.push(draggableImage);
                draggableItems.push(draggableImage);
            });

            console.log("Problem rendered. All items created.");
        }


        // ✅ ฟังก์ชันตรวจสอบความสำเร็จของปัญหาปัจจุบัน (เมื่อจับคู่ครบ)
        function checkProblemCompletion(scene) {
            // ปัญหาปัจจุบันสำเร็จเมื่อสิ่งของที่ลากได้ทุกตัวที่ "มีคู่" ถูกจับคู่ถูกต้อง (isMatched = true)
            // หรือเมื่อจำนวนคู่ที่จับถูก (matchedCount) เท่ากับจำนวนคู่ที่ต้องจับ (correctMapping.length)
            const allPairsMatched = problems[currentProblemIndex].matchedCount === Object.keys(problems[currentProblemIndex].correctMapping).length;

            if (allPairsMatched) {
                solvedProblems++;
                console.log(`Problem ${currentProblemIndex + 1} solved! Total solved problems: ${solvedProblems} out of ${problems.length}`);

                scene.time.delayedCall(1000, () => { // หน่วงเวลาเล็กน้อย
                    currentProblemIndex++;
                    if (currentProblemIndex < problems.length) {
                        problems[currentProblemIndex].matchedCount = 0; // รีเซ็ต matchedCount สำหรับปัญหาใหม่
                        renderProblem(scene, problems[currentProblemIndex]); // แสดงปัญหาถัดไป
                    } else {
                        // แก้ปัญหาครบทุกข้อแล้ว
                        onStageComplete(scene);
                    }
                });
            }
        }


        // ✅ ฟังก์ชันเมื่อด่านสำเร็จ
        function onStageComplete(scene) {
            console.log("Stage 8: onStageComplete called.");
            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts;
            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 90) { starsEarned = 3; } // ปรับเวลาให้เหมาะกับความยากด่าน 8
                else { starsEarned = 2; }
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length * 2) {
                if (durationSeconds <= 120) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0; 
            }

            console.log("Stage 8 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

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

                const winText = scene.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 8 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
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