<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 1;
$game_title = "ลำดับภาพสัตว์";
$next_stage_link = "stage_logic_2.php";
?>


<!DOCTYPE html>
<html lang="th">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>เกมลำดับภาพสัตว์ - ด่านที่ 1</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script>
    const USER_ID = <?= $user_id ?>;
    const STAGE_ID = <?= $stage_id ?>;
    const USER_NAME = "<?= $_SESSION['name'] ?>";
  </script>
  <script src="../assets/js/logic_game/stage1.js"></script>
  <style>
    body {
      font-family: 'Kanit', sans-serif;
      background: linear-gradient(to right, #fef3c7, #bae6fd);
      margin: 0;
    }

    #top-bar {
      background-color: #fde68a;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }


    #game-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    #game-container {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 3 / 2;
      background-color: #fff3cd;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }


    .btn-nav {
      margin-left: 10px;
    }

    @media (max-width: 576px) {
      #top-bar {
        font-size: 0.9rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      #game-container {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 2;
      }
    }

        footer {
            width: 100%;
            margin-top: auto;
            padding: 20px 0;
            text-align: center;
        }

        .footer-box {
            background: rgba(255, 255, 255, 0.75);
            margin: auto;
            padding: 15px 10px;
            border-radius: 15px;
            max-width: 800px;
            font-size: 0.9rem;
        }
  </style>
</head>

<body>

  <!-- แถบด้านบน -->
  <?php include '../includes/game_header.php'; ?>

  <!-- พื้นที่เกม -->
  <div id="game-wrapper">
    <div id="game-container" style="margin: auto; width: 900px; height: 600px;"></div>
  </div>
  <!-- พื้นที่แจ้งเตือน -->
  <div id="feedback-popup" style="
  display:none; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%);
  background:#fff8dc; border:3px solid #facc15; padding:30px; border-radius:16px;
  font-size:28px; text-align:center; box-shadow:0 10px 20px rgba(0,0,0,0.2); z-index:999;
  animation: popIn 0.6s ease;
"></div>

  <style>
    @keyframes popIn {
      0% {
        transform: translate(-50%, -50%) scale(0.6);
        opacity: 0;
      }

      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  </style>

    <?php include '../includes/student_footer.php'; ?>

  <script>
    window.triggerAutoNextStage = function () {
      const nextBtn = document.getElementById("nextStageBtn");
      const secondsSpan = document.getElementById("seconds");
      const overlay = document.getElementById("progress-overlay");

      if (!nextBtn || !secondsSpan || !overlay) {
        console.warn("ไม่พบปุ่มหรือองค์ประกอบสำหรับไปด่านถัดไป");
        return;
      }

      nextBtn.style.display = 'inline-block';
      let count = 10;
      secondsSpan.textContent = count;
      overlay.style.width = '100%';

      const timer = setInterval(() => {
        count--;
        secondsSpan.textContent = count;
        overlay.style.width = (count * 10) + "%";

        if (count <= 0) {
          clearInterval(timer);
          window.location.href = nextBtn.href;
        }
      }, 1000);
    }
  </script>



</body>

</html>