<?php
// File: pages/leaderboard.php
// หน้าแสดงผล Leaderboard แบบเรียลไทม์

session_start(); // เริ่ม session
require_once '../includes/db.php'; // เชื่อมต่อฐานข้อมูล
require_once '../includes/auth.php'; // ฟังก์ชันตรวจสอบสิทธิ์
requireAdmin(); // จำกัดเฉพาะนักเรียนเท่านั้นที่เข้าถึงได้

// ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่ เพื่อแสดงไฮไลท์ใน Leaderboard
$current_user_id = $_SESSION['user_id'] ?? 0;
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏆 Leaderboard - เกมแบบฝึกทักษะ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet" />

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #8ec5fc, #e0c3fc);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            padding-top: 80px; /* เว้นพื้นที่ให้ Header */
        }
        main {
            flex: 1;
            width: 100%;
            max-width: 800px;
            background-color: #fff;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            padding: 30px;
        }
        h1 {
            color: #ff6f61;
            text-align: center;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .leaderboard-table th, .leaderboard-table td {
            text-align: center;
            vertical-align: middle;
            font-size: 1.1rem;
        }
        .leaderboard-table th {
            background-color: #fef3c7;
            color: #b45309;
        }
        .leaderboard-table tbody tr:nth-child(odd) {
            background-color: #f9fafb;
        }
        .leaderboard-table tbody tr.highlight {
            background-color: #fffde7 !important; /* สีไฮไลท์สำหรับผู้เล่นปัจจุบัน */
            font-weight: bold;
            border: 2px solid #facc15;
        }
        .leaderboard-table tbody tr:hover {
            background-color: #e0f8ff;
        }
        .rank-top-1 { font-size: 1.6rem; color: #FFD700; text-shadow: 0 0 5px #FFD700; } /* ทอง */
        .rank-top-2 { font-size: 1.4rem; color: #C0C0C0; text-shadow: 0 0 4px #C0C0C0; } /* เงิน */
        .rank-top-3 { font-size: 1.2rem; color: #CD7F32; text-shadow: 0 0 3px #CD7F32; } /* บรอนซ์ */

        #update-time {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9rem;
            color: #666;
        }
    </style>
</head>

<body>

    <main>
        <h1>🏆 กระดานผู้นำ (Leaderboard) 🏆</h1>
        <a href="dashboard.php" class="btn btn-secondary mb-3">← กลับแดชบอร์ด</a>
        
        <div id="leaderboard-container">
            <table class="table table-striped table-hover leaderboard-table">
                <thead class="table-light">
                    <tr>
                        <th>อันดับ</th>
                        <th>ชื่อนักเรียน</th>
                        <th>ดาวรวมทั้งหมด</th>
                    </tr>
                </thead>
                <tbody id="leaderboard-body">
                    <tr><td colspan="3">กำลังโหลด...</td></tr>
                </tbody>
            </table>
        </div>
        <p id="update-time">อัปเดตเมื่อ: กำลังโหลด...</p>

    </main>
    
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
    <script>
        // กำหนด user_id ของผู้ใช้ปัจจุบันสำหรับไฮไลท์
        const CURRENT_USER_ID = <?= json_encode($current_user_id) ?>;
    </script>
    <script src="../assets/js/leaderboard.js"></script> </body>

</html>