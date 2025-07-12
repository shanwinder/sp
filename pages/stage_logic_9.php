<?php
// File: pages/stage_logic_9.php
// ด่าน 9: วัตถุเปลี่ยนรูป (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)
// ไฟล์นี้จะถูกใช้ทับไฟล์เดิมที่อาจมีอยู่
// ปรับปรุง: คำอธิบายวิธีเล่นอย่างละเอียดใน PHP, ข้อความในเกมใช้ภาษาอังกฤษง่ายๆ

session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';

// --- กำหนดค่าพื้นฐานของด่าน ---
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 9; // ID ของด่านนี้คือ 9
$game_title = "วัตถุเปลี่ยนรูป"; // ชื่อด่าน
$next_stage_link = "stage_logic_10.php";

// หากคุณยังไม่มีไฟล์ stage_logic_10.php สามารถชี้ไปที่ student_dashboard.php ชั่วคราวก่อนได้
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
    <script src="../assets/js/logic_game/stage9.js"></script>
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #fef3c7, #bae6fd);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding-top: 80px;
            /* เว้นพื้นที่สำหรับ Header */
            margin: 0;
            /* ลบ margin เริ่มต้นของ body */
        }

        main {
            flex: 1;
            /* ทำให้ main ขยายเต็มพื้นที่ที่เหลือ */
            width: 100%;
            /* ✅ ทำให้ main ขยายเต็มความกว้างของ body */
            /* ลบ max-width: 900px; และ padding: 30px; ออกจาก main */
            display: flex;
            /* ✅ ทำให้ main เป็น Flex Container */
            flex-direction: column;
            /* ✅ จัดเรียง Child Elements ในแนวตั้ง */
            align-items: center;
            /* ✅ จัด Child Elements (instruction-box, game-container) ให้อยู่กึ่งกลางแนวนอน */
            /* background-color: #fff3cd; ถ้าใส่ตรงนี้ พื้นหลังอาจจะไม่เต็มจอถ้า game-container เล็ก */
        }

        /* ✅ ปรับปรุง: ดีไซน์ #instruction-box-custom ใหม่ ✅ */
        .instruction-box-custom {
            background-color: #fffbeb;
            border-left: 5px solid #f59e0b;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
            max-width: 900px;
            /* ✅ กำหนด max-width ที่นี่ */
            width: 100%;
            /* ให้กินพื้นที่เต็ม max-width */
            margin: 20px auto 0;
            /* ✅ ใช้ margin: auto เพื่อจัดกึ่งกลาง */
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
            content: '📝';
            font-size: 1.5rem;
            margin-right: 0.75rem;
        }

        .instruction-box-custom p {
            font-size: 1.1rem;
            margin-bottom: 0;
            color: #57534e;
        }

        #game-container {
            width: 100%;
            max-width: 900px;
            /* ✅ กำหนด max-width ที่นี่ */
            aspect-ratio: 3 / 2;
            background-color: #fff3cd;
            /* ✅ ย้าย background-color มาที่นี่ */
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            margin: 20px auto;
            /* ✅ ใช้ margin: auto เพื่อจัดกึ่งกลาง */
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
            <h4>📝 วิธีเล่น: คาดการณ์การเปลี่ยนแปลงวัตถุ</h4>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                ในด่านนี้ หนู ๆ จะต้องใช้เหตุผลเชิงตรรกะเพื่อ **คาดการณ์ผลลัพธ์สุดท้าย** ของวัตถุที่ผ่านการเปลี่ยนแปลง
                **หลายขั้นตอน**.
            </p>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                ให้หนู ๆ **สังเกตวัตถุเริ่มต้น** ที่อยู่ทางซ้ายมือ และ **กฎการเปลี่ยนแปลง** ที่อยู่ทางขวาของวัตถุ.
                กฎแต่ละข้อจะบอกว่าวัตถุจะเปลี่ยนไปอย่างไรในแต่ละขั้นตอน.
            </p>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                จากนั้น **ลากภาพผลลัพธ์สุดท้ายที่ถูกต้องที่สุด** จากตัวเลือกที่อยู่ด้านล่างหน้าจอ
                ไปวางในช่องเป้าหมายที่อยู่ทางขวามือสุด.
            </p>
            <p style="font-size: 1rem; color: #92400e;" class="target-goal">
                🎯 เป้าหมาย: คาดการณ์และเลือกภาพผลลัพธ์ที่ถูกต้อง **ครบทุกข้อ** ในด่านนี้! (มีหลายข้อให้ฝึก)
            </p>
        </div>

        <div id="game-wrapper">
            <div id="game-container"></div>
        </div>
        <div id="feedback-popup"></div>
    </main>
<p></p>
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>