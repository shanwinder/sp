// File: assets/js/logic_game/stage2.js
let game;
let autoNextStarted = false; // ยังคงเก็บตัวแปรนี้ไว้

window.onload = function () {
    const config = {
        type: Phaser.AUTO,
        width: Math.min(window.innerWidth, 500),
        height: 700,
        parent: 'game-container',
        backgroundColor: '#fef3c7',
        scene: {
            preload: preload,
            create: create
        }
    };
    game = new Phaser.Game(config);
};

// ลบ: function updateScoreBar() ออกไป เพราะย้ายไป game_common.js แล้ว

function preload() {
    this.load.audio('correct', '../assets/sound/correct.mp3');
    this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function create() {
    // ✅ ไม่ต้องเรียก updateScoreBar() ตรงนี้แล้ว เพราะ game_common.js เรียกให้ตอน DOMContentLoaded
    const scene = this;
    const size = 130;
    const boardSize = 3;
    const offsetX = (scene.game.config.width - (size * boardSize)) / 2 + size / 2;
    const offsetY = 150;

    let roundsPlayed = 0;
    let playerWins = 0;
    let computerWins = 0;
    let gameOver = false;

    const correctSound = this.sound.add('correct');
    const wrongSound = this.sound.add('wrong');

    const statusText = this.add.text(scene.game.config.width / 2, 50, '', {
        fontSize: '22px',
        color: '#333',
        fontFamily: 'Kanit'
    }).setOrigin(0.5);

    let board = [];
    let cells = [];

    function initBoard() {
        board = Array(9).fill('');
        cells.forEach(obj => {
            obj.text.setText('');
            obj.bg.setFillStyle(0xffffff);
        });
        updateStatus();
        gameOver = false;
    }

    function updateStatus() {
        statusText.setText(`รอบที่: ${roundsPlayed + 1} | ชนะ: ${playerWins} | แพ้: ${computerWins}`);
    }

    function checkWinner(bd, symbol) {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        return winConditions.some(c => c.every(i => bd[i] === symbol));
    }

    function computerMove() {
        const available = board.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
        const choice = available[Math.floor(Math.random() * available.length)];
        if (choice != null) {
            board[choice] = 'X';
            cells[choice].text.setText('X');
            cells[choice].bg.setFillStyle(0xfff1f2);
            checkEndGame();
        }
    }

    function checkEndGame() {
        if (gameOver) return;

        let outcome = '';

        if (checkWinner(board, 'O')) {
            correctSound.play();
            playerWins++;
            outcome = 'win';
        } else if (checkWinner(board, 'X')) {
            wrongSound.play();
            computerWins++;
            outcome = 'lose';
        } else if (board.every(v => v !== '')) {
            outcome = 'draw';
        } else {
            updateStatus();
            return;
        }

        gameOver = true;

        if (outcome === 'win') {
            showPopup('🎉 คุณชนะรอบนี้!');
        } else if (outcome === 'lose') {
            showPopup('😞 คอมชนะรอบนี้');
        } else {
            showPopup('😐 เสมอรอบนี้');
        }
    }

    function handleNextRound() {
        // ตรวจสอบเงื่อนไขการชนะเกมทั้งหมด
        if (playerWins >= 3) {
            showPopup('🏆 ชนะครบ 3 รอบ! ผ่านด่าน', true);
            // ✅ ไม่ต้องเรียก triggerAutoNextStage ตรงนี้แล้ว เพราะจะไปเรียกใน sendResult
            return;
        } else if (computerWins >= 2) {
            showPopup('😢 แพ้ 2 ครั้ง เริ่มใหม่', false);
            setTimeout(() => {
                roundsPlayed = 0;
                playerWins = 0;
                computerWins = 0;
                gameOver = false;
                initBoard();
            }, 2500);
            return;
        }

        roundsPlayed++;
        initBoard();
    }

    function showPopup(msg, isFinal = false) {
        const popup = document.getElementById('feedback-popup');
        popup.innerHTML = msg;
        popup.style.display = 'block';

        setTimeout(() => {
            popup.style.display = 'none';
            if (!isFinal) {
                handleNextRound();
            }
        }, 2500);

        if (isFinal) {
            // ✅ เรียก sendResult เพื่อบันทึกคะแนนและ trigger ปุ่มไปด่านถัดไป
            sendResult(100);
        }
    }

    function sendResult(score) {
        // อัปเดต URL ไปยัง submit_stage_score.php
        return fetch('../api/submit_stage_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `stage_id=${STAGE_ID}&score=${score}`
        }).then(() => {
            // เรียก updateScoreBar ที่รวมศูนย์ใน game_common.js
            if (typeof window.updateScoreBar === 'function') {
                window.updateScoreBar();
            }
        }).then(() => {
            // ✅ เรียก triggerAutoNextStage ที่รวมศูนย์ใน game_common.js หลังจากการส่งคะแนนสำเร็จ
            if (typeof window.triggerAutoNextStage === 'function' && !autoNextStarted) {
                window.triggerAutoNextStage();
                autoNextStarted = true; // ตั้งค่าเป็น true เพื่อป้องกันการเรียกซ้ำ
            }
        }).catch(error => {
            console.error('Error sending score:', error);
        });
    }

    for (let i = 0; i < 9; i++) {
        const x = (i % 3) * size + offsetX;
        const y = Math.floor(i / 3) * size + offsetY;
        const bg = this.add.rectangle(x, y, size - 10, size - 10, 0xffffe0)
            .setStrokeStyle(3, 0xfacc15)
            .setInteractive();
        const txt = this.add.text(x, y, '', {
            fontSize: '40px',
            color: '#1e293b',
            fontFamily: 'Kanit'
        }).setOrigin(0.5);

        bg.on('pointerdown', () => {
            if (!gameOver && board[i] === '') {
                board[i] = 'O';
                txt.setText('O');
                bg.setFillStyle(0xd1fae5);
                checkEndGame();
                if (!gameOver) setTimeout(computerMove, 400);
            }
        });

        cells.push({
            bg,
            text: txt
        });
    }

    updateStatus();
    initBoard();
}