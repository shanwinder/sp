// File: assets/js/logic_game/stage2.js (ฉบับใช้อีโมจิที่แสดงผลเต็มช่อง)

(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const config = {
            type: Phaser.AUTO,
            width: 500,
            height: 560,
            parent: 'game-container',
            backgroundColor: '#f0f9ff',
            scene: {
                preload: preload,
                create: create
            }
        };

        function preload() {
            // ไม่ต้องโหลดไฟล์ o.png และ x.png
            this.load.audio('correct', '../assets/sound/correct.mp3');
            this.load.audio('wrong', '../assets/sound/wrong.mp3');
        }

        function create() {
            const scene = this;

            scene.input.once('pointerdown', () => {
                if (scene.sound.context.state === 'suspended') {
                    scene.sound.context.resume();
                }
            });

            // ...
            const graphics = scene.add.graphics();
            // ✅✅✅ แก้ไข: เปลี่ยนชุดสีใหม่ (ฟ้าสว่าง ไป เขียวมิ้นต์) ✅✅✅
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.width, config.height);
            // ...

            const shadow = scene.add.graphics();
            shadow.fillStyle(0x000000, 0.15);
            shadow.fillRoundedRect(30, 30, 440, 500, 20);

            const panel = scene.add.graphics();
            panel.fillStyle(0xffffff, 0.9);
            panel.fillRoundedRect(25, 25, 440, 500, 20);

            const statusTextY = 75;
            const boardOffsetY = 135;
            const size = 110;
            const padding = 15;
            const totalBoardSize = (size * 3) + (padding * 2);
            const boardOffsetX = (config.width - totalBoardSize) / 2;

            let playerWins = 0;
            let computerWins = 0;
            let gameOver = false;
            let roundsPlayed = 0;

            const correctSound = scene.sound.add('correct');
            const wrongSound = scene.sound.add('wrong');

            const statusText = scene.add.text(config.width / 2, statusTextY, '', {
                fontSize: '26px', color: '#1e3a8a', fontFamily: 'Kanit, Arial',
                backgroundColor: '#e0f2fe', padding: { x: 20, y: 10 },
                borderRadius: 12
            }).setOrigin(0.5);

            let board = [];
            let cells = [];

            // ... (ส่วนฟังก์ชันการทำงานของเกมเหมือนเดิม) ...
            function initBoard() { /* ... */ }
            function updateStatus() { /* ... */ }
            function checkWinner(b, symbol) { /* ... */ }
            function computerMove() { /* ... */ }
            function checkEndGame() { /* ... */ }
            function handleNextRound() { /* ... */ }
            function showPopup(msg, isFinal, shouldReset = false) { /* ... */ }
            function sendResult(score) { /* ... */ }

            // สร้างกระดานเกม
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const index = row * 3 + col;
                    const x = boardOffsetX + col * (size + padding) + size / 2;
                    const y = boardOffsetY + row * (size + padding) + size / 2;

                    const bg = scene.add.rectangle(x, y, size, size, 0xffffff)
                        // ✅✅✅ แก้ไขแค่ตรงนี้: เปลี่ยนสีเส้นตารางให้เด่นขึ้น ✅✅✅
                        .setStrokeStyle(3, 0x888888).setInteractive({ useHandCursor: true });

                    // ✅✅✅ แก้ไข: กลับมาใช้ Text Object พร้อมปรับขนาดฟอนต์ให้ใหญ่ ✅✅✅
                    const txt = scene.add.text(x, y, '', {
                        fontSize: '85px', // กำหนดขนาดฟอนต์ให้ใหญ่เพื่อให้อีโมจิเต็มช่อง
                        color: '#000000',
                        fontFamily: 'Arial' // ใช้ฟอนต์ที่รองรับอีโมจิได้ดี
                    }).setOrigin(0.5);

                    bg.on('pointerdown', () => {
                        if (!gameOver && board[index] === '') {
                            board[index] = 'O';
                            txt.setText('⭕'); // แสดงอีโมจิ O
                            bg.setFillStyle(0xdbeafe);
                            checkEndGame();
                            if (!gameOver) scene.time.delayedCall(400, computerMove);
                        }
                    });
                    cells.push({ bg: bg, text: txt });
                }
            }

            // --- คัดลอกฟังก์ชันทั้งหมดมาวางที่นี่ ---
            function initBoard() { board = Array(9).fill(''); cells.forEach(cell => { cell.text.setText(''); cell.bg.setFillStyle(0xffffff).setStrokeStyle(3, 0x888888); }); updateStatus(); gameOver = false; } // ✅✅✅ แก้ไขแค่ตรงนี้: เปลี่ยนสีเส้นตารางให้เด่นขึ้น ✅✅✅
            function updateStatus() { statusText.setText(`รอบที่: ${roundsPlayed + 1}  |  👦 ชนะ: ${playerWins}  |  🤖 แพ้: ${computerWins}`); }
            function checkWinner(b, s) { const c = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; return c.some(p => p.every(i => b[i] === s)); }
            function computerMove() { if (gameOver) return; const a = board.map((v, i) => v === '' ? i : null).filter(v => v !== null); if (a.length > 0) { const c = a[Math.floor(Math.random() * a.length)]; board[c] = 'X'; cells[c].text.setText('❌'); cells[c].bg.setFillStyle(0xfee2e2); checkEndGame(); } } // แสดงอีโมจิ X
            function checkEndGame() { if (gameOver) return; let o = ''; if (checkWinner(board, 'O')) { o = 'win'; playerWins++; correctSound.play(); } else if (checkWinner(board, 'X')) { o = 'lose'; computerWins++; wrongSound.play(); } else if (board.every(v => v !== '')) { o = 'draw'; } if (o) { gameOver = true; handleNextRound(); } }
            function handleNextRound() { if (playerWins >= 3) { showPopup('🏆 คุณชนะแล้ว! ผ่านด่าน!', true); return; } if (computerWins >= 2) { showPopup('😢 แพ้ 2 ครั้ง... เริ่มใหม่นะ', false, true); return; } showPopup('ไปรอบต่อไป...', false, false); }
            function showPopup(msg, isFinal, shouldReset = false) { const p = scene.add.text(config.width / 2, config.height / 2, msg, { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial', backgroundColor: '#000000a0', padding: { x: 20, y: 10 }, borderRadius: 8 }).setOrigin(0.5).setDepth(10); scene.time.delayedCall(2000, () => { p.destroy(); if (isFinal) { sendResult(100); } else if (shouldReset) { roundsPlayed = 0; playerWins = 0; computerWins = 0; initBoard(); } else { roundsPlayed++; initBoard(); } }); }
            function sendResult(score) { fetch('../api/submit_stage_score.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `stage_id=${STAGE_ID}&score=${score}` }).then(() => { if (typeof window.updateScoreBar === 'function') window.updateScoreBar(); if (typeof window.triggerAutoNextStage === 'function') window.triggerAutoNextStage(); }); }

            initBoard();
        }

        new Phaser.Game(config);
    });
})();
