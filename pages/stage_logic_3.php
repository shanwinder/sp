<?php
// File: pages/stage_logic_3.php (ฉบับแก้ไข)
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

// --- กำหนดค่าพื้นฐานของด่าน ---
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 3;
$game_title = "เติมลำดับตัวเลข";
$next_stage_link = "stage_logic_4.php";

?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= htmlspecialchars($game_title) ?> - ด่านที่ <?= htmlspecialchars($stage_id) ?></title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">
    
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            margin: 0;
            padding-top: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #game-container {
            width: 100%;
            max-width: 900px;
            aspect-ratio: 3 / 2;
            margin: 20px auto;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            overflow: hidden;
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
        <p style="font-size: 1.1rem; margin-bottom: 0;">
            สังเกตลำดับของตัวเลข แล้วเติมตัวเลขที่หายไปในช่องว่างให้ถูกต้อง เมื่อตอบถูกครบทุกข้อจะผ่านด่านนี้!
        </p>
    </div>

    <div id="game-container"></div>
    
    <?php include '../includes/student_footer.php'; ?>

    <script>
        const USER_ID = <?= json_encode($user_id) ?>;
        const STAGE_ID = <?= json_encode($stage_id) ?>;
    </script>
    
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage3_phaser_themed.js"></script> 
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>