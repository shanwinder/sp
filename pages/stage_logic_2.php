<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 2;
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

        #top-bar {
            background-color: #fde68a;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

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

    <div id="top-bar">
        <div>
            👦 ผู้เล่น: <strong><?= $_SESSION['name'] ?></strong> |
            🧩 เกม: <strong>OX ตรรกะ</strong> |
            🧠 ด่านที่: <strong>2</strong> |
            🌟 คะแนนรวม: <strong id="total-score">--</strong>
        </div>
        <div>
            <a href="student_dashboard.php" class="btn btn-primary btn-sm">กลับแดชบอร์ด</a>
            <a href="stage_logic_3.php" id="nextStageBtn" class="btn btn-success btn-sm"
                style="display:none;">ไปด่านถัดไป ▶️</a>
        </div>
    </div>

    <div id="game-container"></div>

    <div id="feedback-popup"></div>

    <footer>
        <div>
            <p class="mb-1">พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>
                ครู โรงเรียนบ้านนาอุดม<br>
                สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร</p>
            <p class="text-muted mb-0">&copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai. All rights
                reserved.</p>
        </div>
    </footer>

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

</body>

</html>