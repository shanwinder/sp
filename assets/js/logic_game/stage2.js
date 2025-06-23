// File: assets/js/logic_game/stage2.js

let game;

window.addEventListener('DOMContentLoaded', (event) => {
    const gameContainer = document.getElementById('game-container');
    
    const gameWidth = Math.min(window.innerWidth - 40, 500);
    const gameHeight = 500; // กำหนดความสูงคงที่

    gameContainer.style.width = gameWidth + 'px';
    gameContainer.style.height = gameHeight + 'px';

    const config = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        backgroundColor: '#fef3c7',
        scene: {
            preload: preload,
            create: create
        }
    };
    game = new Phaser.Game(config);

    fetch('../api/get_total_score.php')
        .then(res => res.json())
        .then(data => {
            const totalScoreElement = document.getElementById('total-score');
            if (totalScoreElement) {
                totalScoreElement.textContent = data.score;
            } else {
                console.warn("Element with ID 'total-score' not found.");
            }
        })
        .catch(error => console.error('Error fetching total score:', error));
});


function preload() {
    this.load.audio('correct', '../assets/sound/correct.mp3');
    this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function create() {
    const scene = this;
    const size = 130; // ขนาดของแต่ละช่อง
    const boardSize = 3; // 3x3
    
    const totalBoardDimension = size * boardSize; // 130 * 3 = 390px

    const offsetX = (scene.game.config.width - totalBoardDimension) / 2 + size / 2;
    
    // **แก้ไข offsetY ของกระดาน**
    // กำหนดระยะห่างคงที่ระหว่าง Status Text และกระดาน
    const paddingAfterStatus = 20; // ระยะห่าง 20px จากด้านล่างของ statusText ถึงด้านบนของกระดาน
    
    // กำหนดตำแหน่ง Y ของ statusText ก่อน
    // ให้อยู่ที่ประมาณ 30-40px จากขอบบนของ Canvas (แล้วแต่ความชอบ)
    const statusTextY = 40; 

    // คำนวณ offsetY สำหรับกระดาน โดยเริ่มจากตำแหน่ง Y ของ statusText + ความสูงของ statusText + padding
    // ประมาณการความสูงของ statusText (fontSize 22px + padding/line height เล็กน้อย) = ประมาณ 30px
    const offsetY = statusTextY + 30 + paddingAfterStatus + (totalBoardDimension / 2 - size / 2) + size / 2;
    // หรือให้เข้าใจง่ายขึ้นคือ:
    // ตำแหน่ง Y ของเซลล์แถวแรก (จุดศูนย์กลาง) = statusTextY + (ความสูงของ statusText / 2) + paddingAfterStatus + (size / 2)
    // ดังนั้น offsetY ควรจะเป็น ตำแหน่ง Y ของเซลล์แถวแรก + (ความสูงของกระดาน / 2)
    // แต่เนื่องจาก Phaser กำหนดตำแหน่ง (x,y) ของวัตถุเป็นจุดศูนย์กลาง, เราจะปรับให้ง่ายขึ้น:
    const boardStartingY = statusTextY + 30 + paddingAfterStatus; // จุดเริ่มต้นด้านบนของกระดาน
    const calculatedOffsetY = boardStartingY + (size / 2); // จุดกึ่งกลาง Y ของเซลล์แถวแรก

    // **สรุป offsetY ที่ปรับใหม่ (เพื่อให้ชิดกับ Status)**
    const statusTextHeight = 30; // ประมาณความสูงของ statusText
    const topMarginForStatus = 30; // ระยะห่างจากขอบบน Canvas ถึง Status Text
    const gapBetweenStatusAndBoard = 10; // ระยะห่างระหว่าง Status Text และกระดาน
    
    const statusTextActualY = topMarginForStatus; // ตำแหน่ง Y ของ statusText (จุดศูนย์กลาง)
    
    // ตำแหน่ง Y ของจุดศูนย์กลางของกระดาน
    const boardCenterY = statusTextActualY + (statusTextHeight / 2) + gapBetweenStatusAndBoard + (totalBoardDimension / 2);
    
    // เนื่องจาก for loop สร้างเซลล์โดยใช้ (i % 3) * size + offsetX และ Math.floor(i / 3) * size + offsetY;
    // และ offsetY ที่ใช้คือจุดกึ่งกลางของเซลล์แถวแรก
    // เราต้องการให้เซลล์แรกอยู่หลังจาก statusText เพียงเล็กน้อย
    const finalOffsetY = statusTextActualY + (statusTextHeight / 2) + gapBetweenStatusAndBoard + (size / 2);


    let roundsPlayed = 0;
    let playerWins = 0;
    let computerWins = 0;
    let gameOver = false;

    const correctSound = this.sound.add('correct');
    const wrongSound = this.sound.add('wrong');

    // **แก้ไขตำแหน่งของ statusText**
    const statusText = this.add.text(scene.game.config.width / 2, statusTextActualY, '', {
        fontSize: '22px', color: '#333', fontFamily: 'Kanit'
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
        hidePopup();
    }

    function updateStatus() {
        statusText.setText(`รอบที่: ${roundsPlayed + 1} | ชนะ: ${playerWins} | แพ้: ${computerWins}`);
    }

    function checkWinner(bd, symbol) {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winConditions.some(c => c.every(i => bd[i] === symbol));
    }

    function computerMove() {
        const available = board.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);

        // Logic AI
        for (let i = 0; i < available.length; i++) {
            let tempBoard = [...board];
            tempBoard[available[i]] = 'X';
            if (checkWinner(tempBoard, 'X')) {
                makeMove(available[i], 'X');
                return;
            }
        }
        for (let i = 0; i < available.length; i++) {
            let tempBoard = [...board];
            tempBoard[available[i]] = 'O';
            if (checkWinner(tempBoard, 'O')) {
                makeMove(available[i], 'X');
                return;
            }
        }
        if (board[4] === '' && available.includes(4)) {
            makeMove(4, 'X');
            return;
        }
        const corners = [0, 2, 6, 8];
        const availableCorners = available.filter(idx => corners.includes(idx));
        if (availableCorners.length > 0) {
            makeMove(availableCorners[Math.floor(Math.random() * availableCorners.length)], 'X');
            return;
        }
        const sides = [1, 3, 5, 7];
        const availableSides = available.filter(idx => sides.includes(idx));
        if (availableSides.length > 0) {
            makeMove(availableSides[Math.floor(Math.random() * availableSides.length)], 'X');
            return;
        }
        if (available.length > 0) {
            makeMove(available[Math.floor(Math.random() * available.length)], 'X');
        }
    }

    function makeMove(index, symbol) {
        board[index] = symbol;
        cells[index].text.setText(symbol);
        cells[index].bg.setFillStyle(symbol === 'O' ? 0xd1fae5 : 0xfff1f2);
        checkEndGame();
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
        
        setTimeout(() => {
            hidePopup();
            handleNextRound();
        }, 2500);
    }

    function handleNextRound() {
        if (playerWins >= 3) {
            showPopup('🏆 ชนะครบ 3 รอบ! ผ่านด่าน');
            sendResult(100);
        } else if (computerWins >= 2) {
            showPopup('😢 แพ้ 2 ครั้ง เริ่มใหม่');
            setTimeout(() => {
                roundsPlayed = 0;
                playerWins = 0;
                computerWins = 0;
                initBoard();
            }, 2500);
        } else {
            roundsPlayed++;
            initBoard();
        }
    }

    function showPopup(msg) {
        const popup = document.getElementById('feedback-popup');
        popup.innerHTML = msg;
        popup.style.display = 'block';
    }

    function hidePopup() {
        const popup = document.getElementById('feedback-popup');
        popup.style.display = 'none';
    }

    function sendResult(score) {
        fetch('stage_logic_2.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `score=${score}`
        })
        .then(() => {
            fetch('../api/get_total_score.php')
                .then(res => res.json())
                .then(data => {
                    const totalScoreElement = document.getElementById('total-score');
                    if (totalScoreElement) {
                        totalScoreElement.textContent = data.score;
                    }
                    if (window.triggerAutoNextStage) {
                        window.triggerAutoNextStage();
                    } else {
                        console.error("triggerAutoNextStage function is not available.");
                    }
                })
                .catch(error => console.error('Error updating total score:', error));
        })
        .catch(error => console.error('Error sending result:', error));
    }

    for (let i = 0; i < 9; i++) {
        const x = (i % 3) * size + offsetX;
        const y = Math.floor(i / 3) * size + finalOffsetY; // **ใช้ finalOffsetY ที่คำนวณใหม่**
        const bg = this.add.rectangle(x, y, size - 10, size - 10, 0xffffe0).setStrokeStyle(3, 0xfacc15).setInteractive();
        const txt = this.add.text(x, y, '', {
            fontSize: '40px', color: '#1e293b', fontFamily: 'Kanit'
        }).setOrigin(0.5);

        bg.on('pointerdown', () => {
            if (!gameOver && board[i] === '') {
                makeMove(i, 'O');
                if (!gameOver) {
                    setTimeout(computerMove, 400);
                }
            }
        });

        cells.push({ bg, text: txt });
    }

    initBoard();
}