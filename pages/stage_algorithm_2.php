<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();

$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 7;
$game_title = "บทที่ 2 ด่านที่ 2: เก็บของตามลำดับ";
$next_stage_link = "stage_algorithm_3.php";
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($game_title, ENT_QUOTES, 'UTF-8') ?></title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <link rel="stylesheet" href="../assets/css/game_header.css">

    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>

    <script>
        const USER_ID = <?= json_encode($user_id) ?>;
        const STAGE_ID = <?= json_encode($stage_id) ?>;
    </script>

    <script src="../assets/js/shared/game_common.js"></script>
    <script src="../assets/js/algorithm_game/stage_algorithm_2.js"></script>

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #ecfeff, #fef3c7);
            min-height: 100vh;
            padding-top: 80px;
        }

        #instruction-box {
            background-color: #fff8dc;
            border: 3px dashed #38bdf8;
            border-radius: 16px;
            padding: 20px;
            max-width: 950px;
            margin: 20px auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .mission-order {
            font-size: 1.3rem;
            font-weight: 700;
            color: #92400e;
            background: #fef3c7;
            display: inline-block;
            padding: 6px 18px;
            border-radius: 12px;
            border: 2px solid #f59e0b;
        }

        #game-container {
            width: 100%;
            max-width: 950px;
            aspect-ratio: 3 / 2;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            overflow: hidden;
            margin: 20px auto;
        }

        #nextStageBtn { display: none; }

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

        .prelearn-card { border: 2px solid #d1fae5; border-radius: 14px; }
        .prelearn-card .card-header { background: #ecfdf5; font-weight: 700; border-bottom: 2px solid #d1fae5; }
        .badge-step { background: #d1fae5; color: #065f46; }
        .list-hint li { margin-bottom: .35rem; }
    </style>
</head>

<body>
    <?php include '../includes/game_header.php'; ?>

    <main>
        <div id="instruction-box">
            <h4 style="margin-top:0; font-weight: bold; color: #0369a1;">📝 วิธีเล่น</h4>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">
                น้องหุ่นยนต์จะไปโรงเรียน แต่ต้องเตรียมของให้ <strong>ถูกลำดับ</strong>
                ช่วยเรียงคำสั่งให้หุ่นยนต์เก็บของตามลำดับที่กำหนดให้ครบ
            </p>
            <p class="text-center mb-2">
                <span class="mission-order">📘 หนังสือ → ✏️ ดินสอ → 🎒 กระเป๋า</span>
            </p>
            <p style="font-size: 1rem; color: #92400e;">
                🎯 เป้าหมาย: เก็บของให้ <strong>ครบและถูกลำดับ</strong> แล้วกดปุ่ม <strong>"ทดสอบคำสั่ง"</strong>
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

    <!-- Modal: ความรู้ก่อนเริ่มเกม (ด่าน 2: เก็บของตามลำดับ) -->
    <div class="modal fade" id="preLessonModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">

                <div class="modal-header" style="background: #ecfdf5;">
                    <h5 class="modal-title">📘 ความรู้ก่อนเริ่มเกม: ลำดับขั้นตอนสำคัญอย่างไร?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>

                <div class="modal-body">
                    <!-- ทำไมลำดับถึงสำคัญ -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🤔 ทำไมลำดับถึงสำคัญ?</div>
                        <div class="card-body">
                            <p class="mb-2">
                                อัลกอริทึมไม่ใช่แค่ <strong>"ทำให้ครบ"</strong> แต่ต้อง <strong>"ทำให้ถูกลำดับ"</strong> ด้วย
                            </p>
                            <p class="mb-2">ลองคิดดูนะ ถ้าเราแต่งตัวไปโรงเรียน:</p>
                            <div class="bg-light rounded p-2 mb-2" style="font-size: 1.1rem;">
                                ✅ ถูก: ใส่ชุดนักเรียน → ใส่รองเท้า → ออกจากบ้าน<br>
                                ❌ ผิด: ออกจากบ้าน → ใส่รองเท้า → ใส่ชุดนักเรียน
                            </div>
                            <p class="mb-0 text-muted small">ถึงทำครบทุกอย่าง แต่ถ้าสลับลำดับก็ยังไม่ถูกต้อง!</p>
                        </div>
                    </div>

                    <!-- ขั้นตอนการคิด -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧠 ขั้นตอนการคิดในด่านนี้</div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">1</span>
                                    <strong>อ่านลำดับภารกิจ</strong> – ดูว่าต้องเก็บอะไรก่อน-หลัง
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">2</span>
                                    <strong>นับระยะทาง</strong> – นับว่าต้องเดินกี่ช่องถึงของชิ้นแรก ชิ้นที่สอง ชิ้นที่สาม
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">3</span>
                                    <strong>เรียงคำสั่ง</strong> – วาง "เดินหน้า" และ "เก็บของ" สลับกันให้ถูกจังหวะ
                                </li>
                                <li>
                                    <span class="badge badge-step rounded-pill me-1">4</span>
                                    <strong>ทดสอบ &amp; แก้ไข</strong> – กดดูผลลัพธ์ ถ้าผิดก็ล้างแล้วลองใหม่
                                </li>
                            </ol>
                        </div>
                    </div>

                    <!-- ตัวอย่าง -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">💡 ตัวอย่างเข้าใจเร็ว</div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>ภารกิจ: เก็บ 📘 → ✏️</strong><br>
                                <div class="bg-light rounded p-2 my-1" style="font-size: 1.2rem;">
                                    🤖 ▪️ 📘 ▪️ ✏️
                                </div>
                                คำสั่งที่ถูก: <code>เดินหน้า → เดินหน้า → เก็บของ → เดินหน้า → เดินหน้า → เก็บของ</code> ✅
                            </div>
                            <div class="mb-0">
                                <strong>ถ้าเก็บ ✏️ ก่อน 📘 ล่ะ?</strong><br>
                                ❌ <em>แม้จะเก็บครบ แต่ลำดับผิด ยังไม่ผ่าน!</em><br>
                                <span class="text-muted small">เพราะ "ทำครบ ≠ ทำถูก" → ต้องทำให้ถูกลำดับด้วย</span>
                            </div>
                        </div>
                    </div>

                    <!-- บล็อกคำสั่ง -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧩 บล็อกคำสั่งที่ใช้ได้</div>
                        <div class="card-body">
                            <table class="table table-sm table-bordered mb-0">
                                <thead class="table-light">
                                    <tr><th>บล็อก</th><th>หน้าที่</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>⬆️ <strong>เดินหน้า</strong></td>
                                        <td>หุ่นยนต์เดินไปข้างหน้า 1 ช่อง</td>
                                    </tr>
                                    <tr>
                                        <td>🤲 <strong>เก็บของ</strong></td>
                                        <td>หุ่นยนต์เก็บของในช่องที่ยืนอยู่ (ต้องอยู่ตรงที่มีของ และเป็นของชิ้นที่ถูกลำดับ)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- เคล็ดลับ -->
                    <div class="card prelearn-card mb-1">
                        <div class="card-header">🎯 เคล็ดลับ &amp; จุดพลาดบ่อย</div>
                        <div class="card-body">
                            <ul class="list-hint mb-0">
                                <li>📏 <strong>นับช่องให้ดี</strong> – นับว่าจากของชิ้นนึงไปอีกชิ้นต้องเดินกี่ช่อง</li>
                                <li>🤲 <strong>เก็บของตามลำดับ</strong> – ต้องเก็บหนังสือก่อน แล้วจึงดินสอ แล้วจึงกระเป๋า</li>
                                <li>🚫 <strong>อย่ากดเก็บในช่องว่าง</strong> – ถ้ายังไม่ถึงของ กดเก็บจะไม่ได้</li>
                                <li>🔄 <strong>ผิดก็ลองใหม่</strong> – กดปุ่ม "ล้างคำสั่ง" แล้วเริ่มวางใหม่ได้เลย</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-success" data-bs-dismiss="modal">เข้าใจแล้ว เริ่มเล่นเลย! 🚀</button>
                </div>

            </div>
        </div>
    </div>

</body>
</html>
