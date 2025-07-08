// File: assets/js/logic_game/stage7.js
// ด่าน 7: สัตว์บก สัตว์น้ำ (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ✅ รูปแบบ: Drag & Drop ไปยังประตูมิติจำแนก (Creative & Sophisticated)

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

        // ✅ ข้อมูลปัญหา: กฎการจำแนก, สัตว์ที่ต้องจำแนก, ประตูมิติ/หมวดหมู่
        const problems = [
            { // ปัญหาที่ 1: จำแนกตามถิ่นที่อยู่หลัก (บก/น้ำ/อากาศ)
                rule: "จงจำแนกสัตว์ตามถิ่นที่อยู่หลักของพวกมัน",
                animalsToSort: ["lion", "fish", "bird"],
                portals: [
                    { name: "บก", image: "land_portal", category: "land" },
                    { name: "น้ำ", image: "water_portal", category: "water" },
                    { name: "อากาศ", image: "air_portal", category: "air" }
                ],
                correctMapping: { // สัตว์: หมวดหมู่ที่ถูกต้อง
                    "lion": "land",
                    "fish": "water",
                    "bird": "air"
                },
                sortedCount: 0 // นับจำนวนสัตว์ที่จำแนกถูกในปัญหานี้
            },
            { // ปัญหาที่ 2: สัตว์ครึ่งบกครึ่งน้ำ หรือสัตว์ที่อยู่ได้หลายที่
                rule: "จงจำแนกสัตว์ตามลักษณะการเคลื่อนที่หลัก",
                animalsToSort: ["frog", "snake", "duck"],
                portals: [
                    { name: "กระโดด/เลื้อย", image: "land_portal", category: "walk_crawl" },
                    { name: "ว่ายน้ำ", image: "water_portal", category: "swim" },
                    { name: "บิน", image: "air_portal", category: "fly" }
                ],
                correctMapping: {
                    "frog": "walk_crawl", // กบเดิน/กระโดดบนบก
                    "snake": "walk_crawl",
                    "duck": "swim" // เป็ดว่ายน้ำเป็นหลัก
                },
                sortedCount: 0
            },
            { // ปัญหาที่ 3: สัตว์กินเนื้อ/พืช (ต้องมี Asset เพิ่ม)
                rule: "จงจำแนกสัตว์ตามอาหารที่กิน",
                animalsToSort: ["bear", "rabbit", "tiger"], // bear กินได้ทั้งสอง
                portals: [
                    { name: "กินพืช", image: "plant_portal", category: "herbivore" },
                    { name: "กินเนื้อ", image: "meat_portal", category: "carnivore" }
                ],
                correctMapping: {
                    "bear": "herbivore", // หมีกินพืช (หรือให้เป็น omnivore แล้วเลือกหมวดหลัก)
                    "rabbit": "herbivore",
                    "tiger": "carnivore"
                },
                sortedCount: 0
            }
        ];
        
        let draggableAnimals = []; // Array เก็บสัตว์ที่ลากได้
        let portalZones = []; // Array เก็บ Drop Zone ของประตูมิติ

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            console.log("Stage 7: Preload started.");
            // ✅ โหลดภาพสัตว์ต่างๆ (คุณต้องเตรียมไฟล์ภาพเหล่านี้ไว้ในโฟลเดอร์ assets/img/)
            this.load.image("lion", "../assets/img/animals/lion.webp");
            this.load.image("fish", "../assets/img/animals/fish.webp");
            this.load.image("bird", "../assets/img/animals/bird.webp");
            this.load.image("frog", "../assets/img/animals/frog.webp");
            this.load.image("snake", "../assets/img/animals/snake.webp");
            this.load.image("duck", "../assets/img/animals/duck.webp");
            this.load.image("bear", "../assets/img/animals/bear.webp");
            this.load.image("rabbit", "../assets/img/animals/rabbit.webp");
            this.load.image("tiger", "../assets/img/animals/tiger.webp");

            // ✅ โหลดภาพประตูมิติ (หรือพื้นที่จำแนก)
            this.load.image("land_portal", "../assets/img/portals/land_portal.webp");
            this.load.image("water_portal", "../assets/img/portals/water_portal.webp");
            this.load.image("air_portal", "../assets/img/portals/air_portal.webp");
            this.load.image("plant_portal", "../assets/img/portals/plant_portal.webp"); // สำหรับกินพืช
            this.load.image("meat_portal", "../assets/img/portals/meat_portal.webp");   // สำหรับกินเนื้อ

            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
            console.log("Stage 7: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            console.log("Stage 7: Create started.");
            const scene = this;

            startTime = Date.now();
            attempts = 0; 
            solvedProblems = 0; 
            currentProblemIndex = 0; 

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1); // พื้นหลังไล่สี
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            // พื้นที่แสดงสัตว์ที่จะจำแนก
            const animalZoneBg = scene.add.graphics();
            animalZoneBg.fillStyle(0xFFFFF0, 0.9)
                        .lineStyle(3, 0xFFA000);
            animalZoneBg.strokeRoundedRect(25, 25, 850, 250, 20); // ปรับขนาดให้เหมาะกับสัตว์
            animalZoneBg.fillRoundedRect(25, 25, 850, 250, 20).setDepth(-1);
            
            // พื้นที่แสดงประตูมิติ (Portal Drop Zones)
            const portalZoneBg = scene.add.graphics();
            portalZoneBg.fillStyle(0xF0F8FF, 0.9)
                        .lineStyle(3, 0x4682B4);
            portalZoneBg.strokeRoundedRect(25, 300, 850, 275, 20); // ปรับขนาดให้เหมาะกับ Portal
            portalZoneBg.fillRoundedRect(25, 300, 850, 275, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);
            console.log("Stage 7: Initial problem rendered.");

            // ✅ Event handlers สำหรับการลากและวาง (นำมาจาก stage4/5.js)
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

                // ตรวจสอบว่าเป็น Drop Zone ของ Portal และไม่ได้ถูกจำแนกไปแล้ว
                const isCorrectPortalZone = dropZone.getData('type') === 'portal' && !gameObject.getData('isSorted');
                
                if (isCorrectPortalZone && dropZone.getData('category') === problems[currentProblemIndex].correctMapping[gameObject.getData('animalType')]) { 
                    scene.sound.play('correct');
                    gameObject.disableInteractive(); // ปิดการโต้ตอบของสัตว์ที่จัดแล้ว
                    
                    // ย้ายสัตว์ไปที่ตำแหน่งกลางของ Portal
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y, 
                        scale: 0.8, // ย่อขนาดสัตว์เล็กน้อยเมื่ออยู่ใน Portal
                        duration: 200, ease: 'Power2'
                    });
                    
                    gameObject.setData('isSorted', true); // ตั้งค่าว่าสัตว์ตัวนี้ถูกจำแนกแล้ว
                    problems[currentProblemIndex].sortedCount++; // นับจำนวนสัตว์ที่จำแนกถูกในปัญหานี้
                    
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
            if (!problem || !Array.isArray(problem.animalsToSort)) { // ตรวจสอบ problem.animalsToSort
                console.error("Critical Error: problem or problem.animalsToSort is invalid/undefined in renderProblem. Cannot render stage.", problem);
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

            // ✅ แสดงสัตว์ที่ต้องจำแนก (Draggable Animals)
            const animalSize = 100;
            const animalPadding = 50;
            const totalAnimalsWidth = (problem.animalsToSort.length * animalSize) + ((problem.animalsToSort.length - 1) * animalPadding);
            const animalsStartX = (config.scale.width - totalAnimalsWidth) / 2 + animalSize / 2;
            const animalsY = 200; // ตำแหน่ง Y สำหรับสัตว์

            draggableAnimals = []; // รีเซ็ต array
            problem.animalsToSort.forEach((animalKey, index) => {
                const x = animalsStartX + index * (animalSize + animalPadding);
                const animalImage = scene.add.image(x, animalsY, animalKey)
                                        .setDisplaySize(animalSize, animalSize)
                                        .setInteractive({ useHandCursor: true });
                
                animalImage.setData('originalX', x);
                animalImage.setData('originalY', animalsY);
                animalImage.setData('animalType', animalKey); // เก็บประเภทสัตว์ไว้ตรวจสอบ
                animalImage.setData('isSorted', false); // ยังไม่ถูกจำแนก

                scene.input.setDraggable(animalImage);
                scene.problemElements.push(animalImage);
                draggableAnimals.push(animalImage);
            });


            // ✅ แสดงประตูมิติ (Portal Drop Zones)
            const portalSize = 150; // ขนาด Portal
            const portalPadding = 60;
            const totalPortalsWidth = (problem.portals.length * portalSize) + ((problem.portals.length - 1) * portalPadding);
            const portalsStartX = (config.scale.width - totalPortalsWidth) / 2 + portalSize / 2;
            const portalsY = 440; // ตำแหน่ง Y สำหรับ Portal

            portalZones = []; // รีเซ็ต array
            problem.portals.forEach((portalData, index) => {
                const x = portalsStartX + index * (portalSize + portalPadding);
                const portalImage = scene.add.image(x, portalsY, portalData.image)
                                        .setDisplaySize(portalSize, portalSize);
                
                // สร้าง Drop Zone บน Portal
                const zone = scene.add.zone(x, portalsY, portalSize, portalSize).setRectangleDropZone(portalSize, portalSize);
                zone.setData({ type: "portal", category: portalData.category }); // เก็บประเภท Portal

                // แสดงชื่อ Portal
                const portalNameText = scene.add.text(x, portalsY + portalSize / 2 + 20, portalData.name, {
                    fontSize: '24px', color: '#1e3a8a', fontFamily: 'Kanit, Arial'
                }).setOrigin(0.5);

                scene.problemElements.push(portalImage, zone, portalNameText);
                portalZones.push(zone);
            });

            console.log("Problem rendered. All animals and portals created.");
        }


        // ✅ ฟังก์ชันตรวจสอบความสำเร็จของปัญหาปัจจุบัน (เมื่อสัตว์ถูกจำแนกครบ)
        function checkProblemCompletion(scene) {
            // ปัญหาปัจจุบันสำเร็จเมื่อสัตว์ทุกตัวใน animalsToSort ถูกจำแนก (isSorted = true)
            const allAnimalsSorted = problems[currentProblemIndex].sortedCount === problems[currentProblemIndex].animalsToSort.length;

            if (allAnimalsSorted) {
                solvedProblems++;
                console.log(`Problem ${currentProblemIndex + 1} solved! Total solved problems: ${solvedProblems} out of ${problems.length}`);

                scene.time.delayedCall(1000, () => { // หน่วงเวลาเล็กน้อย
                    currentProblemIndex++;
                    if (currentProblemIndex < problems.length) {
                        // รีเซ็ต sortedCount สำหรับปัญหาใหม่
                        problems[currentProblemIndex].sortedCount = 0; 
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
            console.log("Stage 7: onStageComplete called.");
            const endTime = Date.now();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            let starsEarned = 0;

            const finalAttempts = attempts;
            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 90) { starsEarned = 3; } // ปรับเวลาให้เหมาะกับความยากด่าน 7
                else { starsEarned = 2; }
            } else if (solvedProblems === problems.length && finalAttempts <= problems.length * 2) {
                if (durationSeconds <= 120) { starsEarned = 2; }
                else { starsEarned = 1; }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0; 
            }

            console.log("Stage 7 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts (wrong answers):", finalAttempts, "Solved Problems:", solvedProblems);

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

                const winText = scene.add.text(0, -50, "🎉 ยอดเยี่ยม! ผ่านด่านที่ 7 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
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