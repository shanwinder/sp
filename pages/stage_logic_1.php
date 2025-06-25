<?php
// File: stage_logic_1.php
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
    </script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage1.js"></script>

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            margin: 0;
            padding-top: 80px;
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
            #game-container {
                width: 100%;
                height: auto;
                aspect-ratio: 3 / 2;
            }
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
    max-width: 900px;
    margin: 20px auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
">
        <h4 style="margin-top:0; font-weight: bold; color: #b45309;">📝 วิธีเล่น</h4>
        <p style="font-size: 1.1rem; margin-bottom: 8px;">
            ให้สังเกตลำดับภาพสัตว์ที่ปรากฏ แล้วลากภาพสัตว์ให้เรียงลำดับให้ถูกต้องตามแบบที่แสดง
            โดยภาพจะมีการ <strong>วนซ้ำลำดับ 3 ตัว</strong> ทั้งหมด <strong>2 รอบ</strong>
            จากนั้นให้นักเรียน <strong>ลากภาพที่หายไป</strong> มาใส่ในตำแหน่งที่ถูกต้อง
        </p>
        <p style="font-size: 1rem; color: #92400e;">
            🎯 เป้าหมาย: วางภาพสัตว์ให้ตรงตำแหน่งที่หายไปทั้ง 2 ช่องให้ถูกต้อง
        </p>
    </div>

    <div id="game-wrapper">
        <div id="game-container" style="margin: auto; width: 900px; height: 600px;"></div>
    </div>
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>