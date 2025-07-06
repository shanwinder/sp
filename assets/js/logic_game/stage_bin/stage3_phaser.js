// File: assets/js/logic_game/stage3_phaser.js (สร้างไฟล์ใหม่)

// ใช้ IIFE (Immediately Invoked Function Expression) เพื่อป้องกันตัวแปรชนกับไฟล์อื่น
(function () {
    // รอให้ HTML โหลดเสร็จก่อนค่อยเริ่มทำงาน
    document.addEventListener('DOMContentLoaded', function () {

        // --- การตั้งค่าพื้นฐานของเกม (Phaser Configuration) ---
        const config = {
            type: Phaser.AUTO, // ให้ Phaser เลือกวิธี Render ที่ดีที่สุด (WebGL หรือ Canvas)
            scale: {
                mode: Phaser.Scale.FIT, //ปรับขนาดเกมให้พอดีกับ container โดยรักษาสัดส่วน
                autoCenter: Phaser.Scale.CENTER_BOTH, // จัดเกมให้อยู่กึ่งกลางเสมอ
                width: 900,  // ความกว้างของพื้นที่เกม
                height: 600, // ความสูงของพื้นที่เกม
            },
            parent: "game-container", // บอกให้เกมแสดงผลใน div ที่มี id="game-container"
            scene: {
                preload: preload, // กำหนดฟังก์ชันสำหรับโหลดทรัพยากร
                create: create,   // กำหนดฟังก์ชันสำหรับสร้างองค์ประกอบเกม
            }
        };

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---
        // ฟังก์ชันนี้จะทำงานก่อนที่เกมจะเริ่ม เพื่อโหลดไฟล์ภาพและเสียงทั้งหมดที่ต้องใช้
        function preload() {
            // โหลดรูปภาพต่างๆ ที่จะใช้ในเกม
            this.load.image('background', '../assets/img/backgrounds/factory_bg.png'); // พื้นหลังโรงงาน
            this.load.image('alpha', '../assets/img/characters/alpha_idle.png'); // ตัวละครอัลฟ่า
            this.load.image('sentence_box', '../assets/img/ui/sentence_box.png'); // กล่องสำหรับวางประโยค
            this.load.image('word_block', '../assets/img/ui/word_block.png');     // บล็อกคำศัพท์
            this.load.image('blank_space', '../assets/img/ui/blank_space.png');   // ช่องว่างสำหรับเติมคำ
            
            // โหลดไฟล์เสียง
            this.load.audio('correct_sound', '../assets/sound/correct.mp3'); // เสียงเมื่อตอบถูก
            this.load.audio('wrong_sound', '../assets/sound/wrong.mp3');     // เสียงเมื่อตอบผิด
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---
        // ฟังก์ชันนี้จะทำงานหลังจาก preload เสร็จสิ้น ใช้สำหรับสร้างและจัดวางทุกอย่างในฉาก
        function create() {
            const scene = this; // เก็บ context ของ 'this' (ซึ่งคือ scene) ไว้ในตัวแปรที่ใช้ง่าย

            // สร้างเสียง
            const correctSound = scene.sound.add('correct_sound');
            const wrongSound = scene.sound.add('wrong_sound');
            
            // 1. สร้างพื้นหลังและตัวละคร
            scene.add.image(450, 300, 'background').setScale(0.8); // เพิ่มพื้นหลังและปรับขนาด
            const alpha = scene.add.image(200, 450, 'alpha').setScale(0.5); // เพิ่มตัวละครอัลฟ่า

            // 2. สร้างส่วนของโจทย์ (ประโยคที่มีช่องว่าง)
            scene.add.image(450, 150, 'sentence_box').setScale(1, 0.8); // เพิ่มกล่องพื้นหลังสำหรับประโยค
            scene.add.text(300, 150, 'อัลฟ่า', { fontSize: '32px', color: '#FFFFFF', fontFamily: 'Kanit' }).setOrigin(0.5);
            const dropZone = scene.add.image(450, 150, 'blank_space').setInteractive(); // สร้างช่องว่างและเปิดให้โต้ตอบได้
            dropZone.setData('correct_word', 'เดิน'); // กำหนดคำตอบที่ถูกต้องให้กับช่องว่างนี้
            scene.add.text(620, 150, 'ไปข้างหน้า', { fontSize: '32px', color: '#FFFFFF', fontFamily: 'Kanit' }).setOrigin(0.5);

            // 3. สร้างบล็อกคำศัพท์ที่เป็นตัวเลือก
            const words = ['เดิน', 'หยุด', 'กระโดด'];
            const shuffledWords = Phaser.Utils.Array.Shuffle(words); // สลับลำดับคำศัพท์

            shuffledWords.forEach((word, index) => {
                const x = 300 + (index * 180); // คำนวณตำแหน่ง x ของแต่ละบล็อก
                const y = 350; // กำหนดตำแหน่ง y

                // สร้าง container เพื่อรวมรูปภาพและข้อความเข้าด้วยกัน
                const wordContainer = scene.add.container(x, y);
                const blockImage = scene.add.image(0, 0, 'word_block');
                const blockText = scene.add.text(0, 0, word, { fontSize: '28px', color: '#333333', fontFamily: 'Kanit' }).setOrigin(0.5);
                
                wordContainer.add([blockImage, blockText]); // เพิ่มรูปภาพและข้อความลงใน container
                wordContainer.setSize(blockImage.width, blockImage.height); // กำหนดขนาดของ container
                wordContainer.setInteractive({ useHandCursor: true }); // ทำให้คลิกและลากได้
                
                wordContainer.setData({ text: word, originalX: x, originalY: y }); // เก็บข้อมูลคำศัพท์และตำแหน่งเริ่มต้น

                scene.input.setDraggable(wordContainer); // ทำให้ container นี้สามารถลากได้
            });

            // --- จัดการ Event การลากและวาง ---

            // เมื่อเริ่มลาก
            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject); // นำวัตถุที่ลากมาไว้ด้านบนสุด
                gameObject.setScale(1.1); // ขยายขนาดเล็กน้อย
            });

            // ขณะที่กำลังลาก
            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX; // อัปเดตตำแหน่ง x
                gameObject.y = dragY; // อัปเดตตำแหน่ง y
            });

            // เมื่อปล่อยการลาก
            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                // ถ้าไม่ได้ปล่อยลงใน dropZone ให้กลับที่เดิม
                if (!dropped) {
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'),
                        y: gameObject.getData('originalY'),
                        scale: 1, // กลับขนาดเดิม
                        ease: 'Power2',
                        duration: 300
                    });
                }
            });
            
            // เมื่อลากวัตถุไปวางบน dropZone
            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                // ตรวจสอบว่าคำศัพท์ที่ลากมาถูกต้องหรือไม่
                if (gameObject.getData('text') === dropZone.getData('correct_word')) {
                    // --- กรณีตอบถูก ---
                    correctSound.play(); // เล่นเสียง "ถูกต้อง"
                    gameObject.x = dropZone.x; // ย้ายบล็อกไปที่ตำแหน่งช่องว่าง
                    gameObject.y = dropZone.y;
                    gameObject.input.enabled = false; // ปิดการลากบล็อกที่ตอบถูกแล้ว
                    
                    // แสดง Animation ว่าทำสำเร็จ
                    showWinAnimation(scene);
                } else {
                    // --- กรณีตอบผิด ---
                    wrongSound.play(); // เล่นเสียง "ผิด"
                    // ทำให้บล็อกสั่น
                    scene.cameras.main.shake(150, 0.005); 
                    // ส่งบล็อกกลับไปที่ตำแหน่งเดิม
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'),
                        y: gameObject.getData('originalY'),
                        scale: 1,
                        ease: 'Power2',
                        duration: 300
                    });
                }
            });
        }

        // --- ฟังก์ชันสำหรับแสดงแอนิเมชันเมื่อชนะ ---
        function showWinAnimation(scene) {
            // หน่วงเวลาเล็กน้อยเพื่อให้ผู้เล่นเห็นว่าตอบถูก
            scene.time.delayedCall(500, () => {
                // สร้างพื้นหลังสีดำโปร่งแสงมาปิดทับฉาก
                const overlay = scene.add.rectangle(450, 300, 900, 600, 0x000000, 0.7);
                overlay.setDepth(10); // ตั้งค่าให้อยู่หน้าสุด

                // สร้างข้อความแสดงความยินดี
                const winText = scene.add.text(450, 250, "🎉 ยอดเยี่ยมมาก! 🎉", { 
                    fontSize: '48px', color: '#fde047', fontFamily: 'Kanit', align: 'center' 
                }).setOrigin(0.5).setDepth(11);

                const scoreText = scene.add.text(450, 320, "ได้รับ +100 คะแนน", {
                    fontSize: '32px', color: '#FFFFFF', fontFamily: 'Kanit'
                }).setOrigin(0.5).setDepth(11);

                // ส่งคะแนนไปบันทึก
                sendResult(100);
            });
        }
        
        // --- ฟังก์ชันสำหรับส่งผลลัพธ์ไปที่ Server ---
        function sendResult(score) {
            // ใช้ Fetch API เพื่อส่งข้อมูลไปที่ไฟล์ PHP
            fetch('../api/submit_stage_score.php', {
                method: 'POST', // กำหนด method เป็น POST
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // กำหนด Header
                body: `stage_id=${STAGE_ID}&score=${score}` // ข้อมูลที่จะส่ง
            }).then(response => response.json()) // แปลงการตอบกลับเป็น JSON
              .then(data => {
                  console.log('API Response:', data); // แสดงผลการตอบกลับใน Console (สำหรับตรวจสอบ)
                  // หลังจากส่งคะแนนสำเร็จ, ให้อัปเดตคะแนนบน Header และแสดงปุ่มไปด่านถัดไป
                  if (typeof window.updateScoreBar === 'function') {
                      window.updateScoreBar();
                  }
                  if (typeof window.triggerAutoNextStage === 'function') {
                      window.triggerAutoNextStage();
                  }
              });
        }

        // --- เริ่มสร้างเกม ---
        new Phaser.Game(config);

    });
})();