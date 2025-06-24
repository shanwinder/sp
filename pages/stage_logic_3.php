<?php
// File: stage_logic_3.php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 3;
$game_title = "เติมลำดับตัวเลข";
$next_stage_link = "stage_logic_4.php";

?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <title>เติมลำดับตัวเลข - ด่านที่ 3</title>
    <link rel="stylesheet" href="../assets/css/bootstrap.min.css" />
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css"> <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
        const USER_NAME = "<?= $_SESSION['name'] ?>";
    </script>
    <script src="../assets/js/shared/game_common.js"></script> <script src="../assets/js/logic_game/stage3.js"></script>
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            margin: 0;
            padding-top: 80px;
        }

        #top-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #fffbe6;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            border-bottom: 2px solid #fcd34d;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
            z-index: 999;
        }

        #game-wrapper {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            margin-top: 80px;
        }

        #game-container {
            width: 100%;
            max-width: 600px;
            height: 400px;
            margin: 30px auto;
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
        }

        .game-box {
            border: 3px solid #60a5fa;
            background: #eff6ff;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

    <?php include '../includes/game_header.php'; ?>

    <div id="instruction-box" style="
    background-color: #fff8dc;
    border: 3px dashed #facc15;
    border-radius: 16px;
    padding: 20px;
    max-width: 700px;
    margin: 20px auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
">
        <h4 style="margin-top:0; font-weight: bold; color: #b45309;">📝 วิธีเล่น</h4>
        <p style="font-size: 1.1rem; margin-bottom: 8px;">เติมตัวเลขที่หายไปในลำดับให้ถูกต้อง ตอบถูกครบทั้ง <strong>5 ข้อ</strong> จึงจะผ่านด่านนี้ได้</p>
        <p style="font-size: 1rem; color: #92400e;">
            ใช้ทักษะการสังเกตและคิดเป็นขั้นตอนนะ!</p>
    </div>

    <div id="game-container" class="mt-3"></div>

    <div id="feedback-popup"></div>

    <footer>
        <div>
            <p class="mb-1">พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>ครู โรงเรียนบ้านนาอุดม</p>
            <p class="text-muted mb-0">&copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai</p>
        </div>
    </footer>

    <?php
    // ✅ ยังคง PHP POST block ไว้ในไฟล์นี้ตามที่ผู้ใช้ให้มา
    // หากมีการย้ายไป submit_stage_score.php แล้ว สามารถลบส่วนนี้ได้
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $score = (int) $_POST['score'];
        $completed_at = ($score === 100) ? date('Y-m-d H:i:s') : null;

        $stmt = $conn->prepare("INSERT INTO progress (user_id, stage_id, score, attempts, completed_at)
        VALUES (?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
        score = VALUES(score),
        attempts = attempts + 1,
        completed_at = VALUES(completed_at)");
        $stmt->bind_param("iiis", $user_id, $stage_id, $score, $completed_at);
        $stmt->execute();
        $stmt->close();

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