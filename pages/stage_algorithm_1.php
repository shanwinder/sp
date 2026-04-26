<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();

$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 6;
$game_title = "บทที่ 2 ด่านที่ 1: พาหุ่นยนต์ไปเก็บดาว";
$next_stage_link = "stage_algorithm_2.php";
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($game_title) ?></title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">

    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>

    <script>
        const USER_ID = <?= json_encode($user_id) ?>;
        const STAGE_ID = <?= json_encode($stage_id) ?>;
    </script>

    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/algorithm_game/stage_algorithm_1.js"></script>

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #dcfce7, #bae6fd);
            min-height: 100vh;
            padding-top: 80px;
        }

        #instruction-box {
            background-color: #fff8dc;
            border: 3px dashed #facc15;
            border-radius: 16px;
            padding: 20px;
            max-width: 900px;
            margin: 20px auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        #game-container {
            width: 100%;
            max-width: 900px;
            aspect-ratio: 3 / 2;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            overflow: hidden;
            margin: 20px auto;
        }

        #nextStageBtn {
            display: none;
        }
        
        #feedback-popup {
            display: none;
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff8dc;
            border: 3px solid #facc15;
            padding: 20px 30px;
            border-radius: 16px;
            font-size: 24px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: popIn 0.5s ease;
        }
        
        #feedback-popup button {
            margin-top: 15px;
            padding: 8px 24px;
            font-size: 18px;
            border-radius: 8px;
        }

        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .prelearn-card {
            border: 2px solid #d1fae5;
            border-radius: 14px;
        }
        .prelearn-card .card-header {
            background: #ecfdf5;
            font-weight: 700;
            border-bottom: 2px solid #d1fae5;
        }
        .badge-step {
            background: #d1fae5;
            color: #065f46;
        }
        .list-hint li {
            margin-bottom: .35rem;
        }
    </style>
</head>

<body>
    <?php include '../includes/game_header.php'; ?>

    <main>
        <div id="instruction-box">
            <h4 style="margin-top:0; font-weight: bold; color: #b45309;">📝 วิธีเล่น</h4>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                ให้นักเรียนลากบล็อกคำสั่งมาเรียงลำดับ เพื่อพาหุ่นยนต์เดินไปเก็บดาวให้สำเร็จ
                โดยจะมีทั้งหมด <strong>3 ภารกิจย่อย</strong> ที่ค่อย ๆ เพิ่มระยะทาง
            </p>
            <p style="font-size: 1rem; color: #92400e;">
                🎯 เป้าหมาย: เรียงคำสั่งให้ถูกต้อง แล้วกดปุ่ม <strong>"ทดสอบคำสั่ง"</strong>
            </p>
            <div class="container my-3 text-center">
                <button class="btn btn-info px-4 py-2 fw-semibold"
                    data-bs-toggle="modal" data-bs-target="#preLessonModal">
                    📘 เปิดความรู้ก่อนเล่น
                </button>
            </div>
        </div>

        <div id="game-container"></div>
        <div id="feedback-popup"></div>
    </main>

    <?php include '../includes/student_footer.php'; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>

    <!-- Modal: ความรู้ก่อนเริ่มเกม (อัลกอริทึม) -->
    <div class="modal fade" id="preLessonModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">

                <div class="modal-header" style="background: #ecfdf5;">
                    <h5 class="modal-title">📘 ความรู้ก่อนเริ่มเกม: อัลกอริทึมคืออะไร?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>

                <div class="modal-body">
                    <!-- อัลกอริทึมคืออะไร -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🤔 อัลกอริทึมคืออะไร?</div>
                        <div class="card-body">
                            <p class="mb-2">
                                <strong>อัลกอริทึม</strong> คือ <strong>ขั้นตอนการทำงานที่เรียงลำดับไว้อย่างชัดเจน</strong>
                                เพื่อแก้ปัญหาหรือทำภารกิจให้สำเร็จ
                            </p>
                            <p class="mb-2">เหมือนกับ <strong>"สูตรทำอาหาร"</strong> ที่บอกว่าต้องทำอะไรก่อน-หลัง:</p>
                            <div class="bg-light rounded p-2 mb-2" style="font-size: 1.1rem;">
                                🍳 ตอกไข่ → ตั้งกระทะ → เทไข่ลงกระทะ → ทอดจนสุก → ตักใส่จาน
                            </div>
                            <p class="mb-0 text-muted small">ถ้าสลับลำดับ เช่น เทไข่ก่อนตั้งกระทะ ก็จะทำไม่สำเร็จ!</p>
                        </div>
                    </div>

                    <!-- ขั้นตอนการคิด 4 ขั้น -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧠 ขั้นตอนการคิดแบบอัลกอริทึม 4 ขั้น</div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">1</span>
                                    <strong>อ่านภารกิจ</strong> – ดูว่าหุ่นยนต์อยู่ตรงไหน และดาวอยู่ตรงไหน
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">2</span>
                                    <strong>วางแผน</strong> – นับว่าต้องเดินกี่ช่อง แล้วใช้คำสั่งอะไรบ้าง
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">3</span>
                                    <strong>เรียงคำสั่ง</strong> – ลากบล็อกคำสั่งมาวางตามลำดับที่คิดไว้
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">4</span>
                                    <strong>ทดสอบ &amp; แก้ไข</strong> – กดปุ่ม "ทดสอบคำสั่ง" ดูผลลัพธ์ ถ้าผิดก็แก้ไขใหม่ได้
                                </li>
                            </ol>
                        </div>
                    </div>

                    <!-- ตัวอย่างเข้าใจเร็ว -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">💡 ตัวอย่างเข้าใจเร็ว</div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>ตัวอย่าง 1: ดาวอยู่ห่าง 1 ช่อง</strong><br>
                                <div class="bg-light rounded p-2 my-1" style="font-size: 1.2rem;">
                                    🤖 ▪️ 🌟
                                </div>
                                คำสั่งที่ถูก: <code>เดินหน้า → เก็บดาว</code> ✅
                            </div>
                            <div class="mb-3">
                                <strong>ตัวอย่าง 2: ดาวอยู่ห่าง 3 ช่อง</strong><br>
                                <div class="bg-light rounded p-2 my-1" style="font-size: 1.2rem;">
                                    🤖 ▪️ ▪️ ▪️ 🌟
                                </div>
                                คำสั่งที่ถูก: <code>เดินหน้า → เดินหน้า → เดินหน้า → เก็บดาว</code> ✅
                            </div>
                            <div class="mb-0">
                                <strong>ตัวอย่าง 3: คำสั่งผิด (เก็บดาวก่อนเดินถึง)</strong><br>
                                <div class="bg-light rounded p-2 my-1" style="font-size: 1.2rem;">
                                    🤖 ▪️ ▪️ 🌟
                                </div>
                                คำสั่ง: <code>เดินหน้า → เก็บดาว</code> ❌ <em>(ยังเดินไม่ถึงดาว!)</em>
                            </div>
                        </div>
                    </div>

                    <!-- บล็อกคำสั่งที่ใช้ได้ -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧩 บล็อกคำสั่งที่ใช้ได้</div>
                        <div class="card-body">
                            <table class="table table-sm table-bordered mb-0">
                                <thead class="table-light">
                                    <tr><th>บล็อก</th><th>หน้าที่</th><th>คำแนะนำ</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>⬆️ <strong>เดินหน้า</strong></td>
                                        <td>หุ่นยนต์เดินไปข้างหน้า 1 ช่อง</td>
                                        <td class="text-success">ใช้บ่อยที่สุด!</td>
                                    </tr>
                                    <tr>
                                        <td>⬅️ <strong>เลี้ยวซ้าย</strong></td>
                                        <td>หุ่นยนต์หมุนตัวไปทางซ้าย</td>
                                        <td class="text-muted">ด่านนี้ยังไม่ต้องใช้</td>
                                    </tr>
                                    <tr>
                                        <td>➡️ <strong>เลี้ยวขวา</strong></td>
                                        <td>หุ่นยนต์หมุนตัวไปทางขวา</td>
                                        <td class="text-muted">ด่านนี้ยังไม่ต้องใช้</td>
                                    </tr>
                                    <tr>
                                        <td>⭐ <strong>เก็บดาว</strong></td>
                                        <td>หุ่นยนต์เก็บดาว (ต้องอยู่ตรงตำแหน่งดาว)</td>
                                        <td class="text-warning">ต้องวางเป็นคำสั่งสุดท้าย!</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- เคล็ดลับ & จุดพลาดบ่อย -->
                    <div class="card prelearn-card mb-1">
                        <div class="card-header">🎯 เคล็ดลับ &amp; จุดพลาดบ่อย</div>
                        <div class="card-body">
                            <ul class="list-hint mb-0">
                                <li>📏 <strong>นับช่องก่อน</strong> – นับว่าหุ่นยนต์ต้องเดินกี่ช่องถึงดาว แล้วใส่ "เดินหน้า" ให้ครบจำนวน</li>
                                <li>⭐ <strong>อย่าลืมเก็บดาว</strong> – ถึงแม้หุ่นยนต์จะเดินถึงดาวแล้ว ถ้าไม่มีคำสั่ง "เก็บดาว" ก็จะไม่ผ่าน</li>
                                <li>🚫 <strong>ด่านนี้ไม่ต้องเลี้ยว</strong> – ดาวอยู่ตรงหน้า ไม่ต้องใช้คำสั่งเลี้ยวซ้ายหรือเลี้ยวขวา</li>
                                <li>🔄 <strong>ถ้าผิดไม่เป็นไร!</strong> – กดปุ่ม "ล้างคำสั่ง" แล้วลองใหม่ได้เลย การลองผิดลองถูกก็เป็นส่วนหนึ่งของการเรียนรู้</li>
                            </ul>
                        </div>
                    </div>
                </div> <!-- /modal-body -->

                <div class="modal-footer">
                    <button class="btn btn-success" data-bs-dismiss="modal">เข้าใจแล้ว เริ่มเล่นเลย! 🚀</button>
                </div>

            </div>
        </div>
    </div>

</body>
</html>
