<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/auth.php';

$user_id = $_SESSION['user_id'];
$name = $_SESSION['name'];

// โหลดข้อมูลเกม
$games = [
    1 => ['code' => 'Logic', 'emoji' => '🧠', 'title' => 'แบบฝึกทักษะเหตุผลเชิงตรรกะ'],
    2 => ['code' => 'Algorithm', 'emoji' => '⚙️', 'title' => 'แบบฝึกทักษะอัลกอริทึม'],
    3 => ['code' => 'Text', 'emoji' => '📄', 'title' => 'แบบฝึกทักษะแสดงอัลกอริทึมด้วยข้อความ'],
    4 => ['code' => 'Pseudocode', 'emoji' => '📝', 'title' => 'แบบฝึกทักษะรหัสจำลองหรือซูโดโค้ด'],
    5 => ['code' => 'Flowchart', 'emoji' => '🔄', 'title' => 'แบบฝึกทักษะผังงาน (Flowchart)'],
];

// ฟังก์ชันนับด่านที่ผ่านและคะแนนรวมของแต่ละเกม
function getGameProgress($conn, $user_id, $game_id) {
    // ดึงด่านทั้งหมดของเกมนี้
    $stmt = $conn->prepare("SELECT id FROM stages WHERE game_id = ?");
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $stage_ids = [];
    while ($row = $result->fetch_assoc()) {
        $stage_ids[] = $row['id'];
    }
    $stmt->close();

    if (empty($stage_ids)) return ['passed' => 0, 'total' => 0, 'score' => 0];

    // ด่านทั้งหมดในเกม
    $total = count($stage_ids);

    // นับด่านที่ผ่านและคะแนนรวม
    $placeholders = implode(',', array_fill(0, count($stage_ids), '?'));
    $types = str_repeat('i', count($stage_ids) + 1);
    $params = array_merge([$user_id], $stage_ids);

    $sql = "SELECT COUNT(*) AS passed, SUM(score) AS score FROM progress WHERE user_id = ? AND stage_id IN ($placeholders) AND completed_at IS NOT NULL";
    $stmt = $conn->prepare($sql);
    // ผูกพารามิเตอร์ไดนามิก (mysqli_stmt_bind_param ต้องใช้ call_user_func_array)
    $bind_names[] = $types;
    for ($i=0; $i<count($params); $i++) {
        $bind_names[] = &$params[$i];
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);

    $stmt->execute();
    $result = $stmt->get_result();
    $progress = $result->fetch_assoc();
    $stmt->close();

    $passed = (int)$progress['passed'];
    $score = (int)$progress['score'];

    return ['passed' => $passed, 'total' => $total, 'score' => $score];
}
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <title>แดชบอร์ดนักเรียน</title>
    <link rel="stylesheet" href="../assets/css/bootstrap.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet" />
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to right, #8ec5fc, #e0c3fc);
            min-height: 100vh;
            margin: 0;
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .welcome {
            font-size: 1.6rem;
            margin-bottom: 25px;
            color: #2a2a2a;
            font-weight: 700;
        }
        .game-list {
            display: flex;
            gap: 18px;
            max-width: 900px;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }
        .game-card {
            background: #ffffffcc;
            border-radius: 20px;
            padding: 20px 15px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
            width: 160px;
            height: 320px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
            color: #4a4a4a;
            font-weight: 700;
            font-size: 1.4rem;
            user-select: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            border: 4px solid transparent;
            position: relative;
        }
        .game-card:hover,
        .game-card:focus {
            transform: translateY(-8px);
            box-shadow: 0 16px 30px rgba(0, 0, 0, 0.3);
            border-color: #6a5acd;
            outline: none;
        }
        .game-emoji {
            font-size: 6rem;
            margin-top: 20px;
            pointer-events: none;
            user-select: none;
        }
        .game-code {
            margin: 10px 0 5px;
            font-size: 1.8rem;
            letter-spacing: 1.1px;
        }
        .progress-info {
            margin-top: 10px;
            width: 100%;
            font-size: 1rem;
            color: #333;
        }
        .progress-bar {
            height: 16px;
            border-radius: 12px;
            background: #d1d5db;
            overflow: hidden;
            margin-top: 5px;
        }
        .progress-bar-fill {
            height: 100%;
            background: #6a5acd;
            width: 0;
            border-radius: 12px 0 0 12px;
            transition: width 0.4s ease-in-out;
        }
        /* Responsive */
        @media (max-width: 600px) {
            .game-list {
                flex-direction: column;
                max-width: 320px;
                gap: 25px;
            }
            .game-card {
                width: 100%;
                height: 220px;
                font-size: 1.2rem;
                padding: 15px;
                justify-content: flex-start;
                gap: 10px;
            }
            .game-emoji {
                font-size: 4.5rem;
                margin-top: 0;
            }
            .game-code {
                font-size: 1.5rem;
            }
            .progress-info {
                font-size: 0.9rem;
            }
            .progress-bar {
                height: 12px;
            }
        }
    </style>
</head>

<body>

<?php include '../includes/student_header.php'; ?>

<main class="container my-4 d-flex flex-column align-items-center">
    <div class="welcome">สวัสดีครับ/ค่ะ, <?= htmlspecialchars($name) ?> 👋</div>
    <div class="game-list" role="list" aria-label="รายการแบบฝึกหัดเกม">
        <?php foreach ($games as $game_id => $game):
            $progress = getGameProgress($conn, $user_id, $game_id);
            $percent = ($progress['total'] > 0) ? round(($progress['passed'] / $progress['total']) * 100) : 0;
            $link = "stage.php?game_id=$game_id&stage=1";
        ?>
            <a href="<?= $link ?>" class="game-card" title="<?= htmlspecialchars($game['title']) ?>" tabindex="0" role="listitem" aria-label="<?= htmlspecialchars($game['title']) ?>">
                <div class="game-emoji" aria-hidden="true"><?= $game['emoji'] ?></div>
                <div class="game-code"><?= htmlspecialchars($game['code']) ?></div>
                <div class="progress-info">
                    ด่านที่ทำสำเร็จ: <?= $progress['passed'] ?>/<?= $progress['total'] ?><br>
                    คะแนนรวม: <?= $progress['score'] ?>
                    <div class="progress-bar" aria-label="แถบความก้าวหน้าของเกม <?= htmlspecialchars($game['code']) ?>">
                        <div class="progress-bar-fill" style="width: <?= $percent ?>%;"></div>
                    </div>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</main>

</body>

</html>
