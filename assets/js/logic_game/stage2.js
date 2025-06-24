// File: assets/js/logic_game/stage2.js

let game;

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

// ✅ โหลดคะแนนรวมเมื่อเปิดหน้าขึ้นมา
fetch('../api/get_total_score.php')
  .then(res => res.json())
  .then(data => {
    document.getElementById('total-score').textContent = data.score;
  });

function preload() {
  this.load.audio('correct', '../assets/sound/correct.mp3');
  this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function updateScoreBar() {
  fetch('../api/get_total_score.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('total-score').textContent = data.score;
    });
}

function create() {
  updateScoreBar();
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
    if (playerWins >= 3) {
      showPopup('🏆 ชนะครบ 3 รอบ! ผ่านด่าน');
      sendResult(100);
      return;
    } else if (computerWins >= 2) {
      showPopup('😢 แพ้ 2 ครั้ง เริ่มใหม่');
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


  function showPopup(msg) {
    const popup = document.getElementById('feedback-popup');
    popup.innerHTML = msg;
    popup.style.display = 'block';
    setTimeout(() => {
      popup.style.display = 'none';
      handleNextRound();
    }, 2500);
  }

  function sendResult(score) {
    fetch('stage_logic_2.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `score=${score}`
    }).then(() => {
      fetch('../api/get_total_score.php')
        .then(res => res.json())
        .then(data => {
          document.getElementById('total-score').textContent = data.score;

          const nextBtn = document.getElementById('nextStageBtn');
          if (window.triggerAutoNextStage) {
            window.triggerAutoNextStage(); // ✅ เรียกฟังก์ชันนับถอยหลังและ progress bar
          } else {
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => {
              window.location.href = 'stage_logic_3.php';
            };
          }

        });
    });
  }

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * size + offsetX;
    const y = Math.floor(i / 3) * size + offsetY;
    const bg = this.add.rectangle(x, y, size - 10, size - 10, 0xffffe0).setStrokeStyle(3, 0xfacc15).setInteractive();
    const txt = this.add.text(x, y, '', {
      fontSize: '40px', color: '#1e293b', fontFamily: 'Kanit'
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

    cells.push({ bg, text: txt });
  }

  updateStatus();
  initBoard();
}
