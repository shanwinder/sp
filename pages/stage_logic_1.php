<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 1;
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
      text-align: center;
      padding: 15px 10px;
      background: rgba(255, 255, 255, 0.75);
    }

    footer div {
      max-width: 1000px;
      margin: auto;
      font-size: 0.9rem;
      border-radius: 15px;
    }
  </style>
</head>

<body>

  <!-- แถบด้านบน -->
  <div id="top-bar">
    <div>
      👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?></strong> |
      🧩 เกม: <strong>ลำดับภาพสัตว์</strong> |
      🧠 ด่านที่: <strong>1</strong> |
      🌟 คะแนนรวม: <strong id="total-score">--</strong>
    </div>
    <div>
      <a href="student_dashboard.php" class="btn btn-primary btn-sm">กลับแดชบอร์ด</a>
      <a href="stage_logic_2.php" button id="nextStageBtn" class="btn btn-success btn-sm" style="display: none;">ไปด่านถัดไป ▶️</a>
    </div>
  </div>

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

  <footer>
    <div>
      <p class="mb-1">พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>
        ครู โรงเรียนบ้านนาอุดม<br>
        สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร</p>
      <p class="text-muted mb-0">&copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai. All rights reserved.</p>
    </div>
  </footer>
</body>

</html>