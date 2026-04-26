<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 11;
$game_title = "บทที่ 3 ด่านที่ 1: เรียงขั้นตอนให้ถูก";
$next_stage_link = "stage_text_2.php";
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
    <script>
        const USER_ID = <?= json_encode($user_id) ?>;
        const STAGE_ID = <?= json_encode($stage_id) ?>;
    </script>
    <script src="../assets/js/shared/game_common.js"></script>
    <style>
        body{font-family:'Kanit',sans-serif;background:linear-gradient(135deg,#eff6ff,#fdf2f8);min-height:100vh;padding-top:80px}
        #instruction-box{background:#eff6ff;border:3px dashed #3b82f6;border-radius:16px;padding:20px;max-width:950px;margin:20px auto;box-shadow:0 4px 12px rgba(0,0,0,.1)}
        #game-area{width:100%;max-width:950px;min-height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.15);margin:20px auto;padding:28px 32px;position:relative}
        #nextStageBtn{display:none}
        #feedback-popup{display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff8dc;border:3px solid #facc15;padding:20px 30px;border-radius:16px;font-size:22px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.2);z-index:1000;animation:popIn .5s ease;max-width:500px}
        #feedback-popup button{margin-top:15px;padding:8px 24px;font-size:18px;border-radius:8px}
        @keyframes popIn{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}

        /* Sub-stage header */
        .sub-header{text-align:center;margin-bottom:16px}
        .sub-header h5{color:#1e40af;font-weight:bold;font-size:1.35rem;margin:0}
        .sub-header p{color:#92400e;font-size:1.1rem;margin:4px 0 0}
        .progress-dots{display:flex;justify-content:center;gap:8px;margin-top:8px}
        .progress-dots .dot{width:18px;height:18px;border-radius:50%;background:#e2e8f0;border:2px solid #94a3b8;transition:all .3s}
        .progress-dots .dot.done{background:#22c55e;border-color:#15803d}
        .progress-dots .dot.current{background:#3b82f6;border-color:#1d4ed8;box-shadow:0 0 6px rgba(59,130,246,.5)}

        /* Cards area */
        .cards-pool{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:16px;background:#f8fafc;border-radius:14px;border:2px dashed #cbd5e1;min-height:70px;margin-bottom:18px}
        .card-item{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:12px 20px;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:grab;user-select:none;box-shadow:0 3px 8px rgba(0,0,0,.15);transition:transform .15s,box-shadow .15s;min-width:120px;text-align:center}
        .card-item:hover{transform:translateY(-3px);box-shadow:0 6px 16px rgba(0,0,0,.25)}
        .card-item.distractor{background:linear-gradient(135deg,#f97316,#ea580c)}
        .card-item.dragging{opacity:.5;transform:scale(1.05)}

        /* Slots */
        .slots-area{margin-top:0}
        .slot-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
        .slot-num{width:40px;height:40px;background:#1e40af;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;flex-shrink:0}
        .slot-box{flex:1;min-height:52px;background:#f1f5f9;border:3px dashed #94a3b8;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#94a3b8;transition:all .2s;padding:6px 16px}
        .slot-box.filled{background:#dbeafe;border:3px solid #3b82f6;color:#1e3a5f;font-weight:600}
        .slot-box.drag-over{background:#bfdbfe;border-color:#2563eb;transform:scale(1.02)}
        .slot-box.correct{background:#dcfce7;border-color:#22c55e}
        .slot-box.wrong{background:#fef2f2;border-color:#ef4444}

        /* Buttons */
        .btn-area{display:flex;justify-content:center;gap:16px;margin-top:18px;flex-wrap:wrap}
        .btn-game{padding:12px 28px;border:none;border-radius:12px;font-size:1.1rem;font-weight:bold;font-family:'Kanit';cursor:pointer;transition:all .2s;color:#fff}
        .btn-game:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.2)}
        .btn-check-answer{background:linear-gradient(135deg,#22c55e,#16a34a)}
        .btn-clear{background:linear-gradient(135deg,#ef4444,#dc2626)}
        .btn-hint{background:linear-gradient(135deg,#8b5cf6,#7c3aed)}
    </style>
</head>
<body>
    <?php include '../includes/game_header.php'; ?>
    <main>
        <div id="instruction-box">
            <h4 style="margin-top:0;font-weight:bold;color:#1e40af;">📋 วิธีเล่น — เรียงขั้นตอนให้ถูก</h4>
            <p style="font-size:1.1rem;margin-bottom:8px;">
                อ่านข้อความในการ์ดแต่ละใบ แล้ว<strong>ลากไปวางในช่องลำดับ</strong>ที่ถูกต้อง<br>
                ถ้ามีการ์ดที่ไม่เกี่ยวข้อง <strong>ไม่ต้องนำไปวาง</strong>
            </p>
            <p style="font-size:1rem;color:#92400e;">
                🎯 อ่าน → คิดลำดับ → ลากเรียง → ตรวจผล → แก้ไข
            </p>
        </div>
        <div id="game-area"></div>
        <div id="feedback-popup"></div>
    </main>
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/text_game/stage_text_1.js"></script>
</body>
</html>
