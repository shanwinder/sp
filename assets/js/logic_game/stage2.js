// File: assets/js/logic_game/stage2.js (ฉบับเพิ่มแอนิเมชันแจ้งเตือน)

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

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.width, config.height);

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
                fontSize: '26px', color: '#1e40af', fontFamily: 'Kanit, Arial',
                backgroundColor: '#ffffff', padding: { x: 20, y: 10 },
                borderRadius: 12
            }).setOrigin(0.5);

            let board = [];
            let cells = [];

            // สร้างกระดานเกม
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const index = row * 3 + col;
                    const x = boardOffsetX + col * (size + padding) + size / 2;
                    const y = boardOffsetY + row * (size + padding) + size / 2;

                    const bg = scene.add.rectangle(x, y, size, size, 0xffffff)
                        .setStrokeStyle(3, 0x888888).setInteractive({ useHandCursor: true });

                    const txt = scene.add.text(x, y, '', {
                        fontSize: '85px',
                        fontFamily: 'Arial'
                    }).setOrigin(0.5);

                    bg.on('pointerdown', () => {
                        if (!gameOver && board[index] === '') {
                            board[index] = 'O';
                            txt.setText('⭕');
                            bg.setFillStyle(0xdbeafe);
                            checkEndGame();
                            if (!gameOver) scene.time.delayedCall(400, computerMove);
                        }
                    });
                    cells.push({ bg: bg, text: txt });
                }
            }

            // --- ฟังก์ชันการทำงานของเกม ---
            function initBoard() { board = Array(9).fill(''); cells.forEach(cell => { cell.text.setText(''); cell.bg.setFillStyle(0xffffff).setStrokeStyle(3, 0x888888); }); updateStatus(); gameOver = false; }
            function updateStatus() { statusText.setText(`รอบที่: ${roundsPlayed + 1}  |  👦 ชนะ: ${playerWins}  |  🤖 แพ้: ${computerWins}`); }
            function checkWinner(b, s) { const c = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; return c.some(p => p.every(i => b[i] === s)); }
            function computerMove() { if (gameOver) return; const a = board.map((v, i) => v === '' ? i : null).filter(v => v !== null); if (a.length > 0) { const c = a[Math.floor(Math.random() * a.length)]; board[c] = 'X'; cells[c].text.setText('❌'); cells[c].bg.setFillStyle(0xfee2e2); checkEndGame(); } }
            function checkEndGame() { if (gameOver) return; let o = ''; if (checkWinner(board, 'O')) { o = 'win'; playerWins++; correctSound.play(); } else if (checkWinner(board, 'X')) { o = 'lose'; computerWins++; wrongSound.play(); } else if (board.every(v => v !== '')) { o = 'draw'; } if (o) { gameOver = true; handleNextRound(); } }

            // ✅✅✅ ส่วนที่แก้ไข: ปรับปรุงการทำงานของ handleNextRound และ showPopup ✅✅✅
            function handleNextRound() {
                if (playerWins >= 3) {
                    // เมื่อชนะครบ 3 ครั้ง ให้เรียกใช้ฟังก์ชันแสดงแอนิเมชัน
                    showWinAnimation();
                    return;
                }
                if (computerWins >= 2) {
                    showPopup('😢 แพ้ 2 ครั้ง... เริ่มใหม่นะ', true); // true = รีเซ็ตเกม
                    return;
                }
                showPopup('ไปรอบต่อไป...', false);
            }

            function showPopup(msg, shouldReset = false) {
                const popupText = scene.add.text(config.width / 2, config.height / 2, msg, {
                    fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial',
                    backgroundColor: '#000000a0', padding: { x: 20, y: 10 },
                    borderRadius: 8
                }).setOrigin(0.5).setDepth(10);

                scene.time.delayedCall(2000, () => {
                    popupText.destroy();
                    if (shouldReset) {
                        roundsPlayed = 0; playerWins = 0; computerWins = 0;
                        initBoard();
                    } else {
                        roundsPlayed++;
                        initBoard();
                    }
                });
            }

            function showWinAnimation() {
                const container = scene.add.container(config.width / 2, config.height / 2);
                container.setDepth(10).setAlpha(0).setScale(0.7);

                const rect = scene.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.7).setInteractive();
                container.add(rect);

                const winText = scene.add.text(0, -50, "🏆 ยอดเยี่ยมมาก! 🏆", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
                container.add(winText);

                const scoreText = scene.add.text(0, 20, 'คุณผ่านด่าน OX แล้ว', { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                container.add(scoreText);

                const AddscoreText = scene.add.text(0, 90, ' ได้รับ +100 คะแนน', { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                container.add(AddscoreText);

                scene.tweens.add({
                    targets: container,
                    alpha: 1,
                    scale: 1,
                    duration: 500,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        sendResult(100);
                    }
                });
            }

            function sendResult(score) {
                fetch('../api/submit_stage_score.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `stage_id=${STAGE_ID}&score=${score}`
                }).then(() => {
                    if (typeof window.updateScoreBar === 'function') window.updateScoreBar();
                    if (typeof window.triggerAutoNextStage === 'function') window.triggerAutoNextStage();
                });
            }

            initBoard();
        }

        new Phaser.Game(config);
    });
})();
