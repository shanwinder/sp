// stage1.js

function updateScoreBar() {
  fetch('../api/get_total_score.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('total-score').textContent = data.score;
    })
    .catch(err => console.error("Error fetching score:", err));
}


const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: "game-container",
  backgroundColor: "#fef3c7",
  scene: { preload, create },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("cat", "../assets/img/cat.webp");
  this.load.image("dog", "../assets/img/dog.webp");
  this.load.image("rabbit", "../assets/img/rabbit.webp");
  this.load.audio("correct", "../assets/sound/correct.mp3");
  this.load.audio("wrong", "../assets/sound/wrong.mp3");
}

function create() {
  updateScoreBar(); // โหลดคะแนนทันทีเมื่อเปิดเกม
  const scene = this;
  const sequence = ["dog", "cat", "rabbit", "dog", "cat", "rabbit"];
  const missingIndices = [2, 4];
  const dropZones = [];

  for (let i = 0; i < 6; i++) {
    const x = 100 + i * 130;
    const y = 200;
    if (missingIndices.includes(i)) {
      const zone = scene.add
        .rectangle(x, y, 100, 100, 0xffffff)
        .setStrokeStyle(3, 0x888888)
        .setData("answer", sequence[i])
        .setData("filled", false)
        .setInteractive();
      dropZones.push(zone);
    } else {
      scene.add.image(x, y, sequence[i]).setDisplaySize(100, 100);
    }
  }

  const options = Phaser.Utils.Array.Shuffle(["cat", "rabbit", "dog"]);

  options.forEach((animal, index) => {
    const dragItem = scene.add
      .image(200 + index * 200, 450, animal)
      .setDisplaySize(100, 100)
      .setInteractive()
      .setData("type", animal);
    dragItem.originalX = dragItem.x;
    dragItem.originalY = dragItem.y;

    scene.input.setDraggable(dragItem);
  });

  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  scene.input.on("dragend", (pointer, gameObject) => {
    let placed = false;
    dropZones.forEach((zone) => {
      if (
        !zone.getData("filled") &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          gameObject.getBounds(),
          zone.getBounds()
        )
      ) {
        placed = true;
        zone.setData("filled", true);
        const expected = zone.getData("answer");
        const selected = gameObject.getData("type");

        if (selected === expected) {
          scene.sound.play("correct");
          scene.add.image(zone.x, zone.y, selected).setDisplaySize(100, 100);
          gameObject.destroy();
        } else {
          scene.sound.play("wrong");
          zone.setStrokeStyle(3, 0xef4444);
          scene.time.delayedCall(500, () => {
            zone.setStrokeStyle(3, 0x888888);
          });
          zone.setData("filled", false);
          gameObject.x = gameObject.originalX;
          gameObject.y = gameObject.originalY;
        }

        checkCompletion(scene);
      }
    });

    if (!placed) {
      gameObject.x = gameObject.originalX;
      gameObject.y = gameObject.originalY;
    }
  });
}

function checkCompletion(scene) {
  const filledZones = scene.children.list.filter(c => c.getData && c.getData('filled'));
  if (filledZones.length === 2) {
    scene.time.delayedCall(600, () => {
      const popup = document.getElementById('feedback-popup');
      popup.innerHTML = `
        🎉 เก่งมาก!<br>คุณตอบถูกทั้งหมด<br><small>ได้รับ +100 คะแนน</small>
      `;
      popup.style.display = 'block';

      // ซ่อนหลัง 3 วินาที
      setTimeout(() => popup.style.display = 'none', 3000);

      // ส่งผลและเริ่ม countdown ไปด่านถัดไป
      // sendResult(2) จะเป็นตัวเรียก triggerAutoNextStage() เอง
      sendResult(2);
    });
  }
}

// ... โค้ดส่วนบนของ stage1.js ...

function sendResult(score) {
  return fetch('../api/log_action.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: USER_ID,
      stage_id: STAGE_ID,
      action: score === 2 ? 'pass' : 'fail',
      detail: JSON.stringify({ score })
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Result logged:', data);
    updateScoreBar(); // อัปเดตคะแนน
    console.log('Attempting to trigger auto next stage...'); // เพิ่ม log ตรงนี้
    triggerAutoNextStage(); // <--- จุดที่เรียกฟังก์ชันนับถอยหลัง
  })
  .catch(error => {
    console.error('Error sending result:', error);
  });
}

// ... โค้ดส่วนล่างของ stage1.js ...