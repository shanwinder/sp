<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 10;
$game_title = "บทที่ 2 ด่านที่ 5: ภารกิจเขาวงกตอัลกอริทึม";
$next_stage_link = "stage_text_1.php";
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
    <script src="../assets/js/algorithm_game/stage_algorithm_5.js"></script>
    <style>
        body{font-family:'Kanit',sans-serif;background:linear-gradient(135deg,#ecfdf5,#ede9fe);min-height:100vh;padding-top:80px}
        #instruction-box{background:#f0fdf4;border:3px dashed #22c55e;border-radius:16px;padding:20px;max-width:950px;margin:20px auto;box-shadow:0 4px 12px rgba(0,0,0,.1)}
        #game-container{width:100%;max-width:950px;aspect-ratio:3/2;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.2);overflow:hidden;margin:20px auto}
        #nextStageBtn{display:none}
        #feedback-popup{display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff8dc;border:3px solid #facc15;padding:20px 30px;border-radius:16px;font-size:24px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.2);z-index:1000;animation:popIn .5s ease}
        #feedback-popup button{margin-top:15px;padding:8px 24px;font-size:18px;border-radius:8px}
        @keyframes popIn{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        .prelearn-card{border:2px solid #bbf7d0;border-radius:14px}
        .prelearn-card .card-header{background:#f0fdf4;font-weight:700;border-bottom:2px solid #bbf7d0}
    </style>
</head>
<body>
    <?php include '../includes/game_header.php'; ?>
    <main>
        <div id="instruction-box">
            <h4 style="margin-top:0;font-weight:bold;color:#15803d;">🏁 วิธีเล่น — ภารกิจเขาวงกตอัลกอริทึม</h4>
            <p style="font-size:1.1rem;margin-bottom:8px;">
                ด่านนี้ให้นักเรียน <strong>สร้างชุดคำสั่งเองทั้งชุด</strong> เพื่อพาหุ่นยนต์ผ่านเขาวงกต<br>
                คลิกบล็อกคำสั่งเพื่อเพิ่มเข้าคิว แล้วกด <strong>"ทดสอบ"</strong> ดูผลลัพธ์
            </p>
            <p style="font-size:1rem;color:#92400e;">
                🎯 วางแผน → เรียงคำสั่ง → ทดสอบ → เห็นผลลัพธ์ → แก้ไข → ผ่านภารกิจ
            </p>
            <div class="container my-2 text-center">
                <button class="btn btn-info px-4 py-2 fw-semibold" data-bs-toggle="modal" data-bs-target="#preLessonModal">📘 เปิดความรู้ก่อนเล่น</button>
            </div>
        </div>
        <div id="game-container"></div>
        <div id="feedback-popup"></div>
    </main>
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <div class="modal fade" id="preLessonModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header" style="background:#f0fdf4;">
                    <h5 class="modal-title">📘 ความรู้ก่อนเริ่มเกม: การออกแบบอัลกอริทึม</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>
                <div class="modal-body">
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🧩 สร้างอัลกอริทึมอย่างไร?</div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li><strong>ดูแผนที่</strong> – สังเกตตำแหน่งหุ่นยนต์ เป้าหมาย และสิ่งกีดขวาง</li>
                                <li><strong>วางแผนเส้นทาง</strong> – คิดว่าต้องเดิน เลี้ยว กี่ครั้ง ไปทางไหน</li>
                                <li><strong>เรียงคำสั่ง</strong> – กดเพิ่มบล็อกคำสั่งทีละอัน ตามลำดับ</li>
                                <li><strong>ทดสอบ</strong> – ดูว่าหุ่นยนต์เดินถูกไหม</li>
                                <li><strong>แก้ไข</strong> – ถ้าผิดก็ลบคำสั่งแล้วลองใหม่</li>
                            </ol>
                        </div>
                    </div>
                    <div class="card prelearn-card mb-3">
                        <div class="card-header">🤖 คำสั่งที่ใช้ได้</div>
                        <div class="card-body">
                            <ul class="mb-0">
                                <li>⬆️ <strong>เดินหน้า</strong> – หุ่นยนต์เดินไป 1 ช่องตามทิศที่หันอยู่</li>
                                <li>⬅️ <strong>เลี้ยวซ้าย</strong> – หมุนตัวไปทางซ้าย (ไม่เดิน)</li>
                                <li>➡️ <strong>เลี้ยวขวา</strong> – หมุนตัวไปทางขวา (ไม่เดิน)</li>
                                <li>⭐ <strong>เก็บของ</strong> – เก็บสิ่งของที่อยู่ตรงหน้า</li>
                                <li>🛑 <strong>หยุด</strong> – จบการทำงาน (ต้องอยู่ที่เป้าหมาย)</li>
                            </ul>
                        </div>
                    </div>
                    <div class="card prelearn-card mb-1">
                        <div class="card-header">💡 เคล็ดลับ</div>
                        <div class="card-body">
                            <ul class="mb-0">
                                <li>นับจำนวนช่องก่อนวางคำสั่ง</li>
                                <li>สังเกตทิศทางที่หุ่นยนต์หันอยู่</li>
                                <li>กดทดสอบบ่อย ๆ เพื่อดูว่าพลาดตรงไหน</li>
                                <li>ถ้าพลาดให้ลบคำสั่งท้ายสุดออกก่อน ไม่ต้องล้างทั้งหมด</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" data-bs-dismiss="modal">เข้าใจแล้ว เริ่มเลย! 🚀</button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
