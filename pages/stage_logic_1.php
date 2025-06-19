<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>เกมลำดับภาพสัตว์ - ด่านที่ 1</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Kanit', sans-serif;
      background: linear-gradient(to right, #fef3c7, #bae6fd);
      padding: 20px;
      text-align: center;
    }
    h1 {
      font-size: 48px;
      color: #ff6b81;
      margin-bottom: 20px;
      text-shadow: 1px 1px #fff;
    }
    p.lead {
      font-size: 24px;
      color: #333;
      margin-bottom: 40px;
    }
    .sequence {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .choices {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 30px;
    }
    .animal, .drop-target {
      width: 120px;
      height: 120px;
      border-radius: 16px;
      transition: transform 0.3s ease;
    }
    .drop-target {
      border: 3px dashed #ccc;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .drag-item {
      cursor: grab;
    }
    .drag-item:hover {
      transform: scale(1.1);
      animation: bounce 0.6s;
    }
    button {
      margin-top: 30px;
      padding: 12px 30px;
      font-size: 20px;
      background-color: #f59e0b;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .dragging {
      transform: scale(1.2) rotate(3deg);
      transition: transform 0.2s ease;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      opacity: 0.9;
    }
    .ghost-follow {
      position: absolute;
      width: 120px;
      height: 120px;
      pointer-events: none;
      z-index: 1000;
      animation: wiggle 0.6s infinite ease-in-out;
    }
    @keyframes wiggle {
      0%   { transform: scale(1.2) rotate(5deg); }
      25%  { transform: scale(1.2) rotate(8deg); }
      50%  { transform: scale(1.2) rotate(3deg); }
      75%  { transform: scale(1.2) rotate(7deg); }
      100% { transform: scale(1.2) rotate(5deg); }
    }
    .back-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      font-size: 1rem;
      background-color: #3b82f6;
      color: #fff;
      padding: 10px 16px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .back-btn:hover {
      background-color: #2563eb;
    }
  </style>
</head>
<body>
  <a href="student_dashboard.php" class="back-btn">&larr; กลับสู่หน้าแดชบอร์ด</a>
  <h1>เกมลำดับภาพสัตว์ - ด่านที่ 1</h1>

  <div class="sequence">
    <img src="../assets/img/dog.webp" class="animal">
    <img src="../assets/img/cat.webp" class="animal">
    <div class="drop-target" data-answer="rabbit"></div>
    <img src="../assets/img/dog.webp" class="animal">
    <div class="drop-target" data-answer="cat"></div>
    <img src="../assets/img/rabbit.webp" class="animal">
  </div>
  <p class="lead">ลากสัตว์ที่ถูกต้องมาวางในช่องว่างให้ครบ</p>
  <div class="choices">
    <img src="../assets/img/rabbit.webp" class="drag-item animal" draggable="true" data-name="rabbit">
    <img src="../assets/img/cat.webp" class="drag-item animal" draggable="true" data-name="cat">
    <img src="../assets/img/dog.webp" class="drag-item animal" draggable="true" data-name="dog">
  </div>

  <audio id="correctSound" src="../assets/sound/correct.mp3"></audio>
  <audio id="wrongSound" src="../assets/sound/wrong.mp3"></audio>

  <p id="result" style="font-size: 22px; margin-top: 30px;"></p>

  <script>
    const items = document.querySelectorAll('.drag-item');
    const targets = document.querySelectorAll('.drop-target');
    const result = document.getElementById('result');
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');

    let ghost = null;

    items.forEach(item => {
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('animal', e.target.dataset.name);
        e.dataTransfer.setData('src', e.target.src);
        e.dataTransfer.setDragImage(new Image(), 0, 0);

        item.classList.add('dragging');

        ghost = document.createElement('img');
        ghost.src = e.target.src;
        ghost.className = 'ghost-follow';
        document.body.appendChild(ghost);

        document.addEventListener('dragover', onDragMove);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        if (ghost) {
          ghost.remove();
          ghost = null;
        }
        document.removeEventListener('dragover', onDragMove);
      });
    });

    function onDragMove(e) {
      if (ghost) {
        ghost.style.left = `${e.pageX}px`;
        ghost.style.top = `${e.pageY}px`;
      }
    }

    targets.forEach(target => {
      target.addEventListener('dragover', e => e.preventDefault());
      target.addEventListener('drop', e => {
        e.preventDefault();
        const animal = e.dataTransfer.getData('animal');
        const src = e.dataTransfer.getData('src');
        target.innerHTML = `<img src="${src}" class="animal">`;
        target.dataset.selected = animal;
        checkAuto();
      });
    });

    function checkAuto() {
      let filled = true;
      targets.forEach(t => {
        if (!t.dataset.selected) {
          filled = false;
        }
      });
      if (filled) {
        checkAnswers();
      }
    }

    function checkAnswers() {
      let correct = 0;
      targets.forEach(t => {
        if (t.dataset.selected === t.dataset.answer) {
          correct++;
        }
      });

      if (correct === targets.length) {
        result.textContent = "🎉 เก่งมาก! ตอบถูกทั้งหมด";
        result.style.color = "green";
        correctSound.play();
      } else {
        result.textContent = `❌ ตอบถูก ${correct}/${targets.length} ลองอีกครั้งนะ`;
        result.style.color = "red";
        wrongSound.play();
      }
    }
  </script>
</body>
</html>
