// File: assets/js/logic_game/stage1.js (ฉบับแก้ไขล่าสุด - ตรวจสอบปัญหาจอดำ)

(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const config = {
            type: Phaser.AUTO, // ให้ Phaser เลือกวิธี Render ที่ดีที่สุด (WebGL หรือ Canvas)
            scale: {
                mode: Phaser.Scale.FIT, // ปรับขนาดเกมให้พอดีกับ container โดยรักษาสัดส่วน
                autoCenter: Phaser.Scale.CENTER_BOTH, // จัดเกมให้อยู่กึ่งกลางเสมอ
                width: 900,  // ความกว้างของพื้นที่เกม
                height: 600, // ความสูงของพื้นที่เกม
            },
            input: {
                mouse: {
                    preventDefaultWheel: false // ป้องกันการ scroll หน้าจอเมื่อใช้ล้อเมาส์ในเกม
                }
            },
            parent: "game-container", // บอกให้เกมแสดงผลใน div ที่มี id="game-container"
            scene: {
                preload: preload, // กำหนดฟังก์ชันสำหรับโหลดทรัพยากร
                create: create    // กำหนดฟังก์ชันสำหรับสร้างองค์ประกอบเกม
            }
        };

        // ตัวแปรสำหรับจับเวลาและนับ Attempts ในด่านนี้
        let startTime;     // เวลาเริ่มต้นเล่นด่าน
        let attempts = 0;  // จำนวนครั้งที่พยายามตอบผิด (จะนับเมื่อตอบผิด)

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        function preload() {
            // ตรวจสอบ Path ของรูปภาพและเสียงอย่างละเอียด ว่าถูกต้องและไฟล์มีอยู่จริงบนเซิร์ฟเวอร์
            this.load.image("cat", "../assets/img/cat.webp");
            this.load.image("dog", "../assets/img/dog.webp");
            this.load.image("rabbit", "../assets/img/rabbit.webp");
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        function create() {
            const scene = this; // เก็บ reference ของ scene

            // รีเซ็ตตัวแปรเมื่อด่านเริ่ม
            startTime = Date.now(); // เริ่มจับเวลาเมื่อด่านเริ่ม
            attempts = 0;           // จำนวนครั้งที่ตอบผิด (เริ่มต้น 0)

            // 1. สร้างพื้นหลังและ UI พื้นฐาน
            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1); // สีพื้นหลังไล่โทน
            graphics.fillRect(0, 0, config.scale.width, config.scale.height); // วาดพื้นหลังเต็มจอ
            graphics.setDepth(-2); // ตั้งค่า depth ให้ต่ำสุด เพื่อให้อยู่ด้านหลังสุด

            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1); // พื้นหลังสำหรับโจทย์
            scene.add.text(450, 60, "โจทย์: สังเกตและเรียงลำดับให้ถูกต้อง", { fontSize: '28px', color: '#b45309', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);

            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1); // พื้นหลังสำหรับตัวเลือก
            scene.add.text(450, 375, "ตัวเลือก: ลากไปวางในช่องว่าง", { fontSize: '24px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);

            // 2. สร้างส่วนของโจทย์ (ลำดับภาพและช่องว่าง)
            const sequence = ["dog", "cat", "rabbit", "dog", "cat", "rabbit"]; // ลำดับภาพที่ถูกต้อง
            const missingIndices = [2, 4]; // ตำแหน่งของช่องว่างที่ต้องเติม (นับจาก 0)
            const dropZones = []; // Array เก็บ Drop Zone

            for (let i = 0; i < 6; i++) { // วนลูปสร้างภาพหรือช่องว่าง
                const x = 150 + i * 120; // คำนวณตำแหน่ง X ของแต่ละช่อง
                const y = 180; // ตำแหน่ง Y
                if (missingIndices.includes(i)) { // ถ้าเป็นตำแหน่งที่ต้องเติม
                    // สร้างกรอบสี่เหลี่ยมสำหรับช่องว่าง
                    const outline = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - 50, y - 50, 100, 100);
                    // สร้าง Drop Zone (พื้นที่ที่ลากมาวางได้)
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    zone.setData({ answer: sequence[i], isFilled: false, outline: outline }); // เก็บคำตอบที่ถูกต้องและสถานะ
                    dropZones.push(zone); // เพิ่ม Drop Zone เข้าไปใน Array
                } else { // ถ้าไม่ใช่ตำแหน่งที่ต้องเติม (เป็นภาพปกติ)
                    scene.add.image(x, y, sequence[i]).setDisplaySize(100, 100); // แสดงภาพ
                }
            }

            // 3. สร้างบล็อกคำศัพท์ที่เป็นตัวเลือกสำหรับลาก
            const options = Phaser.Utils.Array.Shuffle(["cat", "rabbit", "dog"]); // สลับลำดับตัวเลือก
            options.forEach((animal, index) => {
                const x = 270 + index * 180;
                const y = 480;
                // สร้างภาพตัวเลือกและทำให้โต้ตอบได้ (ลากได้)
                const dragItem = scene.add.image(x, y, animal).setDisplaySize(100, 100).setInteractive({ useHandCursor: true });
                dragItem.setData({ type: animal, originalX: x, originalY: y }); // เก็บข้อมูลคำตอบและตำแหน่งเริ่มต้น
                scene.input.setDraggable(dragItem); // ทำให้ภาพนี้สามารถลากได้
            });

            // --- จัดการ Event การลากและวาง ---
            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject); // นำวัตถุที่ลากมาไว้ด้านบนสุด
                gameObject.setTint(0xfff7d6); // เปลี่ยนสีเล็กน้อยเมื่อเริ่มลาก
                scene.tweens.add({ targets: gameObject, displayWidth: 110, displayHeight: 110, duration: 150 }); // ขยายขนาดเล็กน้อย
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX; // อัปเดตตำแหน่ง X
                gameObject.y = dragY; // อัปเดตตำแหน่ง Y
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                gameObject.clearTint(); // ลบสีที่เปลี่ยนไปตอนลาก
                const isCorrect = !dropZone.data.values.isFilled && dropZone.data.values.answer === gameObject.getData('type'); // ตรวจสอบว่าถูกต้องและช่องยังว่าง

                if (isCorrect) {
                    scene.sound.play('correct'); // เล่นเสียงถูก
                    gameObject.disableInteractive(); // ปิดการโต้ตอบของบล็อกที่วางถูกแล้ว
                    scene.tweens.add({ // ย้ายบล็อกไปที่ตำแหน่งช่องว่างอย่างนุ่มนวล
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y,
                        displayWidth: 100, displayHeight: 100,
                        duration: 200, ease: 'Power2'
                    });

                    dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100); // เปลี่ยนสีขอบเป็นเขียว
                    dropZone.setData('isFilled', true); // ตั้งค่าว่าช่องถูกเติมแล้ว

                    checkCompletion(scene, dropZones); // ตรวจสอบว่าด่านสำเร็จหรือยัง
                } else {
                    scene.sound.play('wrong'); // เล่นเสียงผิด
                    scene.cameras.main.shake(150, 0.005); // สั่นหน้าจอเล็กน้อย
                    attempts++; // ✅ นับ Attempts เพิ่มเมื่อตอบผิด
                    scene.tweens.add({ // ส่งบล็อกกลับไปที่ตำแหน่งเดิม
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) { // ถ้าไม่ได้ปล่อยลงใน Drop Zone
                    gameObject.clearTint(); // ลบสี
                    scene.tweens.add({ // ส่งบล็อกกลับไปที่ตำแหน่งเดิม
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }

        // --- ฟังก์ชันตรวจสอบความสำเร็จของด่าน ---
        function checkCompletion(scene, dropZones) {
            const correctCount = dropZones.filter(zone => zone.getData('isFilled')).length; // นับช่องที่ถูกเติม
            if (correctCount === dropZones.length) { // ถ้าเติมครบทุกช่อง
                const endTime = Date.now(); // เวลาที่จบด่าน
                const durationSeconds = Math.floor((endTime - startTime) / 1000); // ระยะเวลาที่ใช้

                let starsEarned = 0; // จำนวนดาวที่ได้

                // ตรรกะการให้ดาวสำหรับด่านที่ 1 (ปรับปรุงattempts: ถ้า attempts เป็น 0 แสดงว่าไม่เคยตอบผิดเลย)
                const finalAttempts = attempts; // ใช้ค่า attempts สุดท้ายที่นับได้

                // เกณฑ์การให้ดาว: ปรับได้ตามความเหมาะสม
                if (finalAttempts === 0) { // ตอบถูกทุกช่องในครั้งแรก โดยไม่มีการตอบผิดเลย
                    if (durationSeconds <= 15) { starsEarned = 3; } // เร็วมาก (เช่น น้อยกว่า 15 วินาที)
                    else if (durationSeconds <= 30) { starsEarned = 2; } // เร็วปานกลาง (15-30 วินาที)
                    else { starsEarned = 1; } // ช้า (มากกว่า 30 วินาที)
                } else if (finalAttempts <= 2) { // ตอบผิดไม่เกิน 2 ครั้ง
                    if (durationSeconds <= 45) { starsEarned = 2; } // ไม่ช้ามาก
                    else { starsEarned = 1; } // ช้าหน่อย
                } else { // ตอบผิดมากกว่า 2 ครั้ง
                    starsEarned = 1; // ได้ 1 ดาว
                }

                // ✅ Debug: แสดงค่าที่คำนวณได้ใน Console ก่อนส่ง
                console.log("Stage 1 Complete! Stars to send:", starsEarned, "Duration:", durationSeconds, "Attempts:", finalAttempts);

                // แสดงแอนิเมชันเมื่อด่านสำเร็จ
                scene.time.delayedCall(800, () => { // หน่วงเวลาเล็กน้อย
                    const container = scene.add.container(config.scale.width / 2, config.scale.height / 2);
                    container.setDepth(10); // ให้อยู่ด้านหน้าสุด
                    container.setAlpha(0);
                    container.setScale(0.7);

                    const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
                    container.add(rect);

                    const winText = scene.add.text(0, -50, "🎉 เก่งมาก! ผ่านด่านที่ 1 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
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
                            // ✅ เรียก window.sendResult() เพื่อส่งข้อมูลดาวที่คำนวณได้
                            // STAGE_ID ควรถูกกำหนดใน stage_logic_1.php (เช่น <script> const STAGE_ID = 1; </script>)
                            window.sendResult(STAGE_ID, starsEarned, durationSeconds, finalAttempts);
                        }
                    });
                });
            }
        }

        // เริ่มต้นเกม Phaser
        new Phaser.Game(config);

    }); // End DOMContentLoaded
})(); // End IIFE