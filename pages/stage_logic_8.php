<?php
// File: pages/stage_logic_8.php
// ด่าน 8: สิ่งของใช้คู่กัน (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ไฟล์นี้จะถูกใช้ทับไฟล์เดิมที่อาจมีอยู่
// ปรับปรุง: ด่านจับคู่สิ่งของแบบ Drag & Drop

session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent(); // จำกัดเฉพาะนักเรียนเท่านั้นที่เข้าถึงได้

// --- กำหนดค่าพื้นฐานของด่าน ---
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 8; // ✅ ID ของด่านนี้คือ 8
$game_title = "สิ่งของใช้คู่กัน"; // ✅ ชื่อด่าน
$next_stage_link = "student_dashboard.php"; // ✅ ลิงก์ไปยังด่านถัดไป (ด่าน 9 ของบทที่ 1)

// หากคุณยังไม่มีไฟล์ stage_logic_9.php สามารถชี้ไปที่ student_dashboard.php ชั่วคราวก่อนได้
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
    <script src="../assets/js/logic_game/stage8.js"></script> <style>
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
            margin-top:0; 
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
            display:none; 
            position:fixed; 
            top:30%; 
            left:50%; 
            transform:translate(-50%, -50%);
            background:#fff8dc; 
            border:3px solid #facc15; 
            padding:30px; 
            border-radius:16px;
            font-size:28px; 
            text-align:center; 
            box-shadow:0 10px 20px rgba(0,0,0,0.2); 
            z-index:999;
            animation: popIn 0.6s ease;
        }
        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    </style>
</head>

<body>

    <?php include '../includes/game_header.php'; ?>

    <main>
        <div id="instruction-box">
            <h4>📝 วิธีเล่น: สิ่งของใช้คู่กัน</h4>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                ในด่านนี้ หนู ๆ จะต้อง **จับคู่สิ่งของ** ที่ใช้คู่กันในชีวิตประจำวันให้ถูกต้อง. บางครั้งอาจมีสิ่งของที่ไม่มีคู่ หรือมีตัวหลอกอยู่ด้วยนะ!
            </p>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                **ลากสิ่งของ** จากแถวด้านล่าง ไปวางบน **สิ่งของที่เป็นคู่** ของมันในแถวด้านบน.
            </p>
            <p style="font-size: 1rem; color: #92400e;" class="target-goal">
                🎯 เป้าหมาย: จับคู่สิ่งของทั้งหมดในแต่ละปัญหาให้ถูกต้อง!
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