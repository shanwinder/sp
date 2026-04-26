<?php
session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();
$user_id = $_SESSION['user_id'] ?? 0;
$stage_id = 12;
$game_title = "บทที่ 3 ด่านที่ 2: ขั้นตอนไหนหายไป";
$next_stage_link = "stage_text_3.php"; // placeholder for next stage
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
        body{font-family:'Kanit',sans-serif;background:linear-gradient(135deg,#f0fdf4,#fef3c7);min-height:100vh;padding-top:80px}
        #instruction-box{background:#f0fdf4;border:3px dashed #16a34a;border-radius:16px;padding:20px;max-width:950px;margin:20px auto;box-shadow:0 4px 12px rgba(0,0,0,.1)}
        #game-area{width:100%;max-width:950px;min-height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.15);margin:20px auto;padding:28px 32px;position:relative}
        #nextStageBtn{display:none}
        #feedback-popup{display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff8dc;border:3px solid #facc15;padding:20px 30px;border-radius:16px;font-size:22px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.2);z-index:1000;animation:popIn .5s ease;max-width:500px}
        #feedback-popup button{margin-top:15px;padding:8px 24px;font-size:18px;border-radius:8px}
        @keyframes popIn{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}

        /* Sub-stage header */
        .sub-header{text-align:center;margin-bottom:16px}
        .sub-header h5{color:#166534;font-weight:bold;font-size:1.35rem;margin:0}
        .sub-header p{color:#92400e;font-size:1.1rem;margin:4px 0 0}
        .progress-dots{display:flex;justify-content:center;gap:8px;margin-top:8px}
        .progress-dots .dot{width:18px;height:18px;border-radius:50%;background:#e2e8f0;border:2px solid #94a3b8;transition:all .3s}
        .progress-dots .dot.done{background:#22c55e;border-color:#15803d}
        .progress-dots .dot.current{background:#eab308;border-color:#a16207;box-shadow:0 0 6px rgba(234,179,8,.5)}

        /* Cards area */
        .cards-pool{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:16px;background:#f8fafc;border-radius:14px;border:2px dashed #cbd5e1;min-height:70px;margin-bottom:18px}
        .card-item{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:12px 20px;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:grab;user-select:none;box-shadow:0 3px 8px rgba(0,0,0,.15);transition:transform .15s,box-shadow .15s;min-width:120px;text-align:center}
        .card-item:hover{transform:translateY(-3px);box-shadow:0 6px 16px rgba(0,0,0,.25)}
        .card-item.dragging{opacity:.5;transform:scale(1.05)}

        /* Layout */
        .steps-container{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;align-items:center}
        .step-row{display:flex;align-items:center;gap:12px;width:100%;max-width:600px}
        .step-num{width:40px;height:40px;background:#15803d;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;flex-shrink:0}
        
        .step-text{flex:1;min-height:52px;background:#f8fafc;border:2px solid #cbd5e1;border-radius:12px;display:flex;align-items:center;padding:6px 16px;font-size:1.1rem;color:#334155}
        
        .blank-slot{flex:1;min-height:52px;background:#fefce8;border:3px dashed #eab308;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#a16207;transition:all .2s;padding:6px 16px}
        .blank-slot.filled{background:#fffbeb;border:3px solid #f59e0b;color:#92400e;font-weight:600}
        .blank-slot.drag-over{background:#fef08a;border-color:#ca8a04;transform:scale(1.02)}
        .blank-slot.correct{background:#dcfce7;border-color:#22c55e}
        .blank-slot.wrong{background:#fef2f2;border-color:#ef4444}

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
            <h4 style="margin-top:0;font-weight:bold;color:#166534;">📋 วิธีเล่น — ขั้นตอนไหนหายไป</h4>
            <p style="font-size:1.1rem;margin-bottom:8px;">
                อ่านลำดับขั้นตอน และ<strong>ลากการ์ดข้อความไปเติมในช่องว่าง</strong>ที่หายไป<br>
                สังเกตขั้นตอน <strong>ก่อนและหลัง</strong> เพื่อเลือกข้อความที่ถูกต้องที่สุด
            </p>
            <p style="font-size:1rem;color:#92400e;">
                🎯 อ่าน → หาช่องว่าง → เติมให้ครบ → ตรวจคำตอบ
            </p>
        </div>
        <div id="game-area"></div>
        <div id="feedback-popup"></div>
    </main>
    <?php include '../includes/student_footer.php'; ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/text_game/stage_text_2.js"></script>
</body>
</html>
