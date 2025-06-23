<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 2;
$game_title = "OX ตรรกะ";
$next_stage_link = "stage_logic_3.php";
?>


<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <title>เกม OX ตรรกะ - ด่านที่ 2</title>
    <link rel="stylesheet" href="../assets/css/bootstrap.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
        const USER_NAME = "<?= $_SESSION['name'] ?>";
    </script>
    <script src="../assets/js/logic_game/stage2.js"></script>
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            margin: 0;
        }

<<<<<<< HEAD
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
=======
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
>>>>>>> 75573f659dbf7d25a99c20a39778118c4cb8c51f

        #game-container {
            width: 100%;
            max-width: 600px;
            height: 600px;
            margin: 20px auto;
        }

        #feedback-popup {
            display: none;
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff8dc;
            border: 3px solid #facc15;
            padding: 30px;
            border-radius: 16px;
            font-size: 28px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            z-index: 999;
            animation: popIn 0.6s ease;
        }

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

        #nextStageBtn {
            animation: pulse 1s infinite;
            font-weight: bold;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }

        #countdown {
            font-size: 1rem;
            color: #d97706;
            margin-left: 10px;
            display: none;
        }
    </style>
</head>

<body>

<<<<<<< HEAD
<?php include '../includes/game_header.php'; ?>
=======
    <?php
    $game_title = "OX ตรรกะ";
    $next_stage_link = "stage_logic_3.php";
    include '../includes/game_header.php';
    ?>
    <div class="container mt-4" style="max-width: 700px;">
        <div class="alert alert-warning" role="alert" style="font-size: 1.1rem;">
            <strong>📝 วิธีการเล่น:</strong><br>
            เล่นเกม OX กับคอมพิวเตอร์ โดยคุณเป็นฝั่ง <strong>⭕</strong> และคอมเป็น <strong>❌</strong><br>
            เป้าหมายคือ ชนะให้ได้ <strong>3 ใน 5 เกม</strong> จึงจะผ่านด่านนี้ได้<br>
            ใช้ทักษะการวางแผนและการคาดการณ์ล่วงหน้าอย่างมีเหตุผล!
        </div>
    </div>

    <div class="text-center">
        <a href="stage_logic_3.php" id="nextStageBtn" class="btn btn-success btn-sm" style="display:none;">
            ไปด่านถัดไป ▶️</a>
        <span id="countdown">(กำลังไปใน <span id="seconds">10</span> วินาที...)</span>
    </div>
>>>>>>> 75573f659dbf7d25a99c20a39778118c4cb8c51f

    <div id="game-container"></div>

    <div id="feedback-popup"></div>

<<<<<<< HEAD
    <?php include '../includes/student_footer.php'; ?>
=======
    <script>
        const nextBtn = document.getElementById("nextStageBtn");
        const countdownText = document.getElementById("countdown");
        const secondsSpan = document.getElementById("seconds");

        function triggerAutoNextStage() {
            nextBtn.style.display = 'inline-block';
            countdownText.style.display = 'inline';
            let count = 10;
            const timer = setInterval(() => {
                count--;
                secondsSpan.textContent = count;
                if (count <= 0) {
                    clearInterval(timer);
                    window.location.href = nextBtn.href;
                }
            }, 1000);
        }
        window.triggerAutoNextStage = triggerAutoNextStage; // ให้ stage2.js เรียกใช้ได้
    </script>
>>>>>>> 75573f659dbf7d25a99c20a39778118c4cb8c51f

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $score = (int) $_POST['score'];
        $completed_at = ($score === 100) ? date('Y-m-d H:i:s') : null;

        // อัปเดต progress
        $stmt = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, attempts, completed_at)
      VALUES (?, ?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE
      score = VALUES(score),
      attempts = attempts + 1,
      completed_at = VALUES(completed_at)");
        $stmt->bind_param("iiis", $user_id, $stage_id, $score, $completed_at);
        $stmt->execute();
        $stmt->close();

        // log การกระทำ
        $action = ($score === 100) ? 'pass' : 'fail';
        $detail = json_encode(['score' => $score]);
        $stmt = $conn->prepare("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiss", $user_id, $stage_id, $action, $detail);
        $stmt->execute();
        $stmt->close();

        exit;
    }
    ?>

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
