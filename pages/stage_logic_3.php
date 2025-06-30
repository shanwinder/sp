<?php
// File: stage_logic_3.php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'];
$stage_id = 3;
$game_title = "เติมลำดับตัวเลข";
$next_stage_link = "student_dashboard.php"; // หรือด่านถัดไป

?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <title>เติมลำดับตัวเลข - ด่านที่ 3</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #87CEEB, #98FB98);
            margin: 0;
            padding-top: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #game-wrapper {
            position: relative;
            /* ทำให้เป็นกรอบเขตแดนสำหรับ overlay */
            width: 100%;
            max-width: 700px;
            background-color: #ffffffcc;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
            padding: 30px;
            min-height: 300px;
        }

        #win-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
            border-radius: 20px;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            /* ไม่ดักจับการคลิกเมื่อซ่อน */
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        #win-overlay.visible {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .win-box {
            color: white;
            text-align: center;
            transform: scale(0.7);
            transition: transform 0.4s ease;
        }

        #win-overlay.visible .win-box {
            transform: scale(1);
        }

        .win-box h2 {
            font-size: 48px;
            color: #fde047;
            margin-bottom: 10px;
        }

        .win-box p {
            font-size: 32px;
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

    <div id="instruction-box" class="alert alert-warning" style="max-width: 700px; margin: 20px auto 0;">
        <h4 style="margin-top:0; font-weight: bold;">📝 วิธีเล่น</h4>
        <p style="font-size: 1.1rem; margin-bottom: 0;">
            เติมตัวเลขที่หายไปในลำดับให้ถูกต้อง ตอบถูกครบทุกข้อเพื่อผ่านด่าน!
        </p>
    </div>

    <!-- ✅✅✅ แก้ไข: แยกโครงสร้างใหม่ให้ชัดเจน ✅✅✅ -->
    <div id="game-wrapper" class="mt-3">
        <!-- ส่วนสำหรับแสดงโจทย์ จะถูกสร้างโดย JavaScript -->
        <div id="problem-container"></div>

        <!-- ส่วนสำหรับแสดงหน้าต่างแจ้งเตือนตอนผ่านด่าน -->
        <div id="win-overlay">
            <div class="win-box">
                <h2>✨ เก่งที่สุดเลย! ✨</h2>
                <p>คุณผ่านด่านลำดับตัวเลขแล้ว</p>
                <p>ได้รับ +100 คะแนน</p>
            </div>
        </div>
    </div>


    <?php include '../includes/student_footer.php'; ?>

    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
    </script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage3.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>