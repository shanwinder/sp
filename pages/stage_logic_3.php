<?php
// File: pages/stage_logic_3.php (ฉบับแก้ไขสมบูรณ์และสวยงาม)

// --- 1. การเตรียมข้อมูลเบื้องต้น ---
session_start(); // เริ่ม session เพื่อจัดการข้อมูลผู้ใช้
require_once '../includes/auth.php'; // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
require_once '../includes/db.php';   // เชื่อมต่อฐานข้อมูล

// --- 2. การกำหนดค่าสำหรับด่าน ---
$user_id = $_SESSION['user_id'];
$stage_id = 3;
$game_title = "เติมลำดับตัวเลข";
$next_stage_link = "stage_logic_4.php";

?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($game_title) ?> - ด่านที่ <?= $stage_id ?></title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">
    
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #f3f9ff 0%, #e0f2fe 100%);
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding-top: 70px;
        }

        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            padding: 20px;
        }

        #game-area {
            background-color: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 800px;
            text-align: center;
        }

        #game-container {
            width: 100%;
            max-width: 700px;
            margin: 0 auto 1.5rem auto; /* เว้นระยะห่างด้านล่าง */
            border-radius: 12px;
            overflow: hidden; /* ทำให้ขอบมนสวยงาม */
            border: 2px solid #e2e8f0;
        }

        #answer-input {
            width: 150px;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            border: 2px solid #cbd5e1;
            border-radius: 10px;
        }

        #check-button {
            font-size: 1.25rem;
            padding: 0.75rem 2rem;
            border-radius: 12px;
            font-weight: bold;
        }

        #feedback-text {
            min-height: 40px; /* จองพื้นที่สำหรับข้อความ Feedback */
            font-size: 1.5rem;
            font-weight: bold;
            transition: all 0.3s ease;
        }
    </style>
</head>

<body>

    <?php include '../includes/game_header.php'; ?>
    
    <main>
        <div class="alert alert-primary" role="alert" style="max-width: 800px; width: 100%;">
            <h4 class="alert-heading">📝 วิธีเล่น</h4>
            <p>ให้นักเรียนสังเกตแบบรูปของตัวเลขที่แสดงขึ้นมา แล้วเติมตัวเลขที่หายไปในช่องว่างให้ถูกต้อง</p>
            <hr>
            <p class="mb-0">เมื่อตอบถูกครบทุกข้อ จะถือว่าผ่านด่านนี้นะครับ!</p>
        </div>

        <div id="game-area">
            <div id="game-container"></div>
            
            <div class="my-3">
                <input type="number" id="answer-input" class="form-control d-inline-block" placeholder="?">
            </div>
            <button id="check-button" class="btn btn-success">✔️ ตรวจคำตอบ</button>
            
            <div id="feedback-text" class="mt-3"></div>
        </div>
    </main>
    
    <?php include '../includes/student_footer.php'; ?>

    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
    </script>
    
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage3.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>