<?php
// File: pages/stage_logic_4.php
// ด่าน 4: แบบรูปเรขาคณิต (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ไฟล์นี้จะถูกใช้ทับไฟล์เดิมที่อาจมีอยู่

session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

// --- กำหนดค่าพื้นฐานของด่าน ---
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 4; // ID ของด่านนี้คือ 4
$game_title = "แบบรูปเรขาคณิต";
$next_stage_link = "stage_logic_5.php";

// หากคุณยังไม่มีไฟล์ stage_logic_5.php สามารถชี้ไปที่ student_dashboard.php ชั่วคราวก่อนได้
// $next_stage_link = "student_dashboard.php"; 
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title><?= htmlspecialchars($game_title) ?> - ด่านที่ <?= htmlspecialchars($stage_id) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script>
        const USER_ID = <?= json_encode($user_id) ?>;
        const STAGE_ID = <?= json_encode($stage_id) ?>;
    </script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage4.js"></script>
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding-top: 80px;
        }

        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        #game-container {
            width: 100%;
            max-width: 900px;
            aspect-ratio: 3 / 2;
            background-color: #fff3cd;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            margin: 20px auto;
        }

        .btn-nav {
            margin-left: 10px;
        }

        @media (max-width: 576px) {
            #game-container {
                width: 100%;
                height: auto;
                aspect-ratio: 3 / 2;
            }
        }

        #instruction-box {
            background-color: #fff8dc;
            border: 3px dashed #facc15;
            border-radius: 16px;
            padding: 20px;
            max-width: 900px;
            margin: 20px auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        #instruction-box h4 {
            margin-top: 0;
            font-weight: bold;
            color: #b45309;
        }

        #instruction-box p {
            font-size: 1.1rem;
            margin-bottom: 8px;
        }

        #instruction-box p.target-goal {
            font-size: 1rem;
            color: #92400e;
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
    </style>
</head>

<body>

    <?php include '../includes/game_header.php'; ?>

    <main>
        <div id="instruction-box">
            <h4>📝 วิธีเล่น</h4>
            <p>
                สังเกตแบบรูปของรูปทรง แล้วลากรูปทรงที่ถูกต้องมาเติมในช่องว่าง!
            </p>
            <p class="target-goal">
                🎯 เป้าหมาย: เติมรูปทรงที่หายไปให้ถูกต้องทั้งหมด
            </p>
        </div>

        <div id="game-wrapper">
            <div id="game-container"></div>
        </div>
        <div id="feedback-popup"></div>
    </main>

    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>