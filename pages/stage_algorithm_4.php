<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 9;
$game_title = "บทที่ 2 ด่านที่ 4: นักแก้บั๊กเส้นทาง";
$next_stage_link = "stage_algorithm_5.php";
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
    <script src="../assets/js/algorithm_game/stage_algorithm_4.js"></script>
    <style>
        body{font-family:'Kanit',sans-serif;background:linear-gradient(135deg,#fef2f2,#ede9fe);min-height:100vh;padding-top:80px}
        #instruction-box{background:#fff8dc;border:3px dashed #f87171;border-radius:16px;padding:20px;max-width:950px;margin:20px auto;box-shadow:0 4px 12px rgba(0,0,0,.1)}
        #game-container{width:100%;max-width:950px;aspect-ratio:3/2;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.2);overflow:hidden;margin:20px auto}
        #nextStageBtn{display:none}
        #feedback-popup{display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff8dc;border:3px solid #facc15;padding:20px 30px;border-radius:16px;font-size:24px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.2);z-index:1000;animation:popIn .5s ease}
        #feedback-popup button{margin-top:15px;padding:8px 24px;font-size:18px;border-radius:8px}
        @keyframes popIn{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        .prelearn-card{border:2px solid #fecaca;border-radius:14px}
        .prelearn-card .card-header{background:#fef2f2;font-weight:700;border-bottom:2px solid #fecaca}
    </style>
</head>
<body>
    <?php include '../includes/game_header.php'; ?>
    <main>
        <div id="instruction-box">
            <h4 style="margin-top:0;font-weight:bold;color:#b91c1c;">🐛 วิธีเล่น — นักแก้บั๊กเส้นทาง</h4>
            <p style="font-size:1.1rem;margin-bottom:8px;">
                หุ่นยนต์มีชุดคำสั่งอยู่แล้ว แต่มี <strong>ข้อผิดพลาด (บั๊ก)</strong> ซ่อนอยู่<br>
                ให้นักเรียนกดทดสอบดูก่อน แล้ว <strong>หาจุดผิดและแก้ไข</strong> ให้หุ่นยนต์ทำภารกิจสำเร็จ
            </p>
            <p style="font-size:1rem;color:#92400e;">
                🎯 เป้าหมาย: ตรวจหาคำสั่งที่ผิด แล้ว <strong>แก้ไขให้ถูกต้อง</strong>
            </p>
            <div class="container my-3 text-center">
                <button class="btn btn-info px-4 py-2 fw-semibold" data-bs-toggle="modal" data-bs-target="#preLessonModal">📘 เปิดความรู้ก่อนเล่น</button>
            </div>
        </div>
        <div id="game-container"></div>
        <div id="feedback-popup"></div>
    </main>
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <div class="modal fade" id="preLessonModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header" style="background:#fef2f2;">
                    <h5 class="modal-title">📘 ความรู้ก่อนเริ่มเกม: Debugging คืออะไร?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>
                <div class="modal-body">
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🐛 Bug คืออะไร?</div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Bug (บั๊ก)</strong> คือ <strong>ข้อผิดพลาดในชุดคำสั่ง</strong> ที่ทำให้ผลลัพธ์ไม่ตรงกับที่ต้องการ</p>
                            <div class="bg-light rounded p-2 mb-2" style="font-size:1.1rem;">
                                🐛 เหมือนสูตรทำไข่เจียว แต่เขียนว่า "เทน้ำแทนน้ำมัน" → ผลลัพธ์ผิด!
                            </div>
                            <p class="mb-0"><strong>Debugging</strong> คือ การหาจุดผิดแล้วแก้ให้ถูก</p>
                        </div>
                    </div>
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧠 ขั้นตอนการแก้บั๊ก</div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li><strong>ทดสอบก่อน</strong> – กดทดสอบเพื่อดูว่าหุ่นยนต์ผิดพลาดตรงไหน</li>
                                <li><strong>สังเกต</strong> – ดูว่าหุ่นยนต์ไปผิดจุดไหน</li>
                                <li><strong>หาจุดผิด</strong> – เลือกคำสั่งที่ทำให้ผิดพลาด</li>
                                <li><strong>แก้ไข</strong> – เปลี่ยน/เพิ่ม/ย้ายคำสั่งให้ถูก</li>
                                <li><strong>ทดสอบอีกครั้ง</strong> – ดูว่าแก้แล้วถูกไหม</li>
                            </ol>
                        </div>
                    </div>
                    <div class="card prelearn-card mb-1">
                        <div class="card-header">💡 เคล็ดลับ</div>
                        <div class="card-body">
                            <ul class="mb-0">
                                <li>กด <strong>"ทดสอบคำสั่ง"</strong> ก่อนแก้ไข เพื่อดูว่าหุ่นยนต์ผิดตรงไหน</li>
                                <li>สังเกตจังหวะที่หุ่นยนต์เริ่มเดินผิดทาง</li>
                                <li>ถ้าแก้ผิด กดล้างแล้วลองใหม่ได้เลย!</li>
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
