<?php
// File: pages/stage_logic_4.php (ฉบับปรับปรุง UI)
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 4;
$game_title = "เรียงสีตามเงื่อนไข";
$next_stage_link = "student_dashboard.php";

?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $game_title ?> - ด่านที่ <?= $stage_id ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #87CEEB, #98FB98);
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
            width: 100%;
        }
        #game-container {
            width: 100%;
            max-width: 900px;
            margin: 20px auto;
            display: flex;
            justify-content: center;
        }
        /* ✅✅✅ ดีไซน์ #instruction-box ใหม่ ✅✅✅ */
        .instruction-box-custom {
            background-color: #fffbeb;
            border-left: 5px solid #f59e0b;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            max-width: 900px;
            margin: 20px auto 0;
            padding: 1.25rem;
        }
        .instruction-box-custom h4 {
            color: #b45309;
            font-weight: bold;
            margin-top: 0;
            display: flex;
            align-items: center;
        }
        .instruction-box-custom h4::before {
            content: '📝'; /* Emoji */
            font-size: 1.5rem;
            margin-right: 0.75rem;
        }
        .instruction-box-custom p {
            font-size: 1.1rem;
            margin-bottom: 0;
            color: #57534e;
        }
    </style>
</head>

<body>

    <?php include '../includes/game_header.php'; ?>
    
    <main>
        <!-- ✅✅✅ ใช้คลาส CSS ใหม่ที่นี่ ✅✅✅ -->
        <div class="instruction-box-custom">
            <h4>วิธีเล่น</h4>
            <p>
                อ่านเงื่อนไขที่กำหนด แล้วลากลูกบอลสีต่างๆ ไปวางในช่องว่างให้ถูกต้องตามเงื่อนไขทั้งหมด
            </p>
        </div>

        <div id="game-container"></div>
    </main>
    
    <?php include '../includes/student_footer.php'; ?>

    <script>
        const USER_ID = <?= $user_id ?>;
        const STAGE_ID = <?= $stage_id ?>;
    </script>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/logic_game/stage4.js"></script>
</body>

</html>
