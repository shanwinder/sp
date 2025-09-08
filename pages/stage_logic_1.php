<?php
// File: stage_logic_1.php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent(); // จำกัดเฉพาะนักเรียนเท่านั้นที่เข้าถึงได้

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
        <div class="container my-3 text-center">
            <button class="btn btn-info px-4 py-2 fw-semibold"
                data-bs-toggle="modal" data-bs-target="#preLessonModal">
                📘 เปิดความรู้ก่อนเล่น
            </button>
        </div>

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

        .prelearn-card {
            border: 2px solid #e0e7ff;
            border-radius: 14px;
        }

        .prelearn-card .card-header {
            background: #eef2ff;
            font-weight: 700;
            border-bottom: 2px solid #e0e7ff;
        }

        .badge-step {
            background: #dbeafe;
            color: #1e3a8a;
        }

        .list-hint li {
            margin-bottom: .35rem;
        }
    </style>


    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>

    <!-- Modal: ความรู้ก่อนเริ่มเกม (Pattern & ลำดับความคิด) -->
    <div class="modal fade" id="preLessonModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">ความรู้ก่อนเริ่มเกม: ลำดับรูปแบบ (Pattern)</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>

                <div class="modal-body">
                    <!-- เป้าหมาย & คำสำคัญ -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">เป้าหมาย &amp; คำสำคัญ</div>
                        <div class="card-body">
                            <ul class="mb-2">
                                <li>รู้จัก <strong>หน่วยซ้ำ</strong> (ช่วงที่วนซ้ำ เช่น “🐶🐱”)</li>
                                <li>ทำตาม <strong>ลำดับความคิด 6 ขั้น</strong> เพื่อทายรูปถัดไปอย่างมีเหตุผล</li>
                                <li>อธิบายได้ว่า “ทำไมคำตอบถึงใช่” ไม่ใช่การเดา</li>
                            </ul>
                            <div class="small text-muted">คำสำคัญ: หน่วยซ้ำ • ตำแหน่ง • กฎ</div>
                        </div>
                    </div>

                    <!-- ลำดับความคิด 6 ขั้น -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">ลำดับความคิด 6 ขั้น (จำง่าย ทำตามได้จริง)</div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li><span class="badge badge-step rounded-pill me-1">1</span><strong>สังเกต</strong> – มองทั้งแวก่อน ดูว่ามีอะไร “วนซ้ำ/สลับ” ไหม</li>
                                <li><span class="badge badge-step rounded-pill me-1">2</span><strong>จัดกลุ่ม</strong> – ลองแบ่งเป็นช่วงสั้น ๆ เช่น 🐶🐱 | 🐶🐱 | …</li>
                                <li><span class="badge badge-step rounded-pill me-1">3</span><strong>หาหน่วยซ้ำ</strong> – หน่วยที่เหมือนเดิมเสมอ เช่น “🐶🐱”</li>
                                <li><span class="badge badge-step rounded-pill me-1">4</span><strong>ตั้งกฎ</strong> – เขียนกฎสั้น ๆ เช่น “สลับหมา–แมว หน่วยยาว 2”</li>
                                <li><span class="badge badge-step rounded-pill me-1">5</span><strong>ทดสอบ</strong> – เอากฎไปลองกับรูปถัด ๆ ไป ถ้าไม่ตรง ปรับกฎใหม่</li>
                                <li><span class="badge badge-step rounded-pill me-1">6</span><strong>ทำนาย</strong> – ใช้กฎทายตำแหน่งที่โจทย์ถาม พร้อมเหตุผล</li>
                            </ol>
                        </div>
                    </div>

                    <!-- ตัวอย่างเข้าใจเร็ว -->
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">ตัวอย่างเข้าใจเร็ว</div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>ตัวอย่าง 1: ABAB…</strong><br>
                                🐶🐱 | 🐶🐱 | 🐶 ? → หน่วยซ้ำ = “🐶🐱” (ยาว 2) → ตัวที่ 6 = ตำแหน่ง 2 ของหน่วย → <em>🐱</em>
                            </div>
                            <div class="mb-2">
                                <strong>ตัวอย่าง 2: AAB AAB…</strong><br>
                                🐼🐼🐵 | 🐼🐼🐵 | 🐼 ? ? → หน่วยซ้ำ = “🐼🐼🐵” (ยาว 3) → ตัวที่ 6 = ตำแหน่ง 3 → <em>🐵</em>
                            </div>
                            <div>
                                <strong>ตัวอย่าง 3: ABC ABC…</strong><br>
                                🐯🐸🐔 | 🐯🐸🐔 | 🐯 ? ? → หน่วยซ้ำ = “🐯🐸🐔” (ยาว 3) → 10 ÷ 3 เหลือ 1 → ตำแหน่ง 1 → <em>🐯</em>
                            </div>
                        </div>
                    </div>

                    <!-- เคล็ดลับ & จุดพลาดบ่อย -->
                    <div class="card prelearn-card mb-1">
                        <div class="card-header">เคล็ดลับ &amp; แก้จุดพลาดบ่อย</div>
                        <div class="card-body">
                            <ul class="list-hint mb-0">
                                <li>อย่ารีบตอบจาก 2–3 ตัวแรก ให้ “จัดกลุ่ม–ทดสอบ” อย่างน้อย 2 หน่วย</li>
                                <li>ถ้าหน่วยซ้ำดูแปลก ลองย้ายเส้นแบ่ง (บางทีหน่วยคือ AAB ไม่ใช่ AA)</li>
                                <li>เขียนเลขใต้รูป 1–10 ช่วยไม่หลงตำแหน่งเวลาทำนาย</li>
                            </ul>
                        </div>
                    </div>
                </div> <!-- /modal-body -->

                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
                </div>

            </div>
        </div>
    </div>

    <!-- (ทางเลือก) Log การเปิดโมดัล เพื่อใช้วิเคราะห์บทที่ 4 -->
    <script>
        (function() {
            const el = document.getElementById('preLessonModal');
            if (!el) return;
            el.addEventListener('shown.bs.modal', async () => {
                try {
                    await fetch('../api/lesson_event.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            event_type: 'prelesson_view',
                            stage_key: 'logic_1'
                        })
                    });
                } catch (e) {}
            });
        })();
    </script>

</body>

</html>