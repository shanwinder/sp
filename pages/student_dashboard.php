<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/auth.php';

$user_id = $_SESSION['user_id'];
$name = $_SESSION['name'];

$games = [
    1 => ['code' => 'Logic', 'title' => 'แบบฝึกทักษะเหตุผลเชิงตรรกะ'],
    2 => ['code' => 'Algorithm', 'title' => 'แบบฝึกทักษะอัลกอริทึม'],
    3 => ['code' => 'Text', 'title' => 'แบบฝึกทักษะแสดงอัลกอริทึมด้วยข้อความ'],
    4 => ['code' => 'Pseudocode', 'title' => 'แบบฝึกทักษะรหัสจำลองหรือซูโดโค้ด'],
    5 => ['code' => 'Flowchart', 'title' => 'แบบฝึกทักษะผังงาน (Flowchart)'],
];

function getGameProgress($conn, $user_id, $game_id)
{
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

    $total = count($stage_ids);
    $placeholders = implode(',', array_fill(0, count($stage_ids), '?'));
    $types = str_repeat('i', count($stage_ids) + 1);
    $params = array_merge([$user_id], $stage_ids);

    $sql = "SELECT COUNT(*) AS passed, SUM(score) AS score FROM progress WHERE user_id = ? AND stage_id IN ($placeholders) AND completed_at IS NOT NULL";
    $stmt = $conn->prepare($sql);
    $bind_names[] = $types;
    for ($i = 0; $i < count($params); $i++) {
        $bind_names[] = &$params[$i];
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);

    $stmt->execute();
    $result = $stmt->get_result();
    $progress = $result->fetch_assoc();
    $stmt->close();

    return [
        'passed' => (int)$progress['passed'],
        'total' => $total,
        'score' => (int)$progress['score']
    ];
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
            position: relative;
            animation: fadeZoom 0.7s ease-in-out;
        }

        @keyframes fadeZoom {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .background-stars {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1;
            background-image: url('../assets/img/star-bg.svg');
            background-size: cover;
            background-repeat: repeat;
            opacity: 0.07;
            animation: floatBG 30s linear infinite;
        }

        @keyframes floatBG {
            0% {
                background-position: 0 0;
            }
            100% {
                background-position: 100% 100%;
            }
        }

        .welcome {
            font-size: 1.6rem;
            margin-bottom: 25px;
            color: #2a2a2a;
            font-weight: 700;
        }

        .game-list {
            display: flex;
            gap: 20px;
            max-width: 1000px;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }

        .game-card {
            position: relative;
            width: 250px;
            height: 410px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 24px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 4px solid rgba(255, 255, 255, 0.3);
            outline: 1px solid rgba(0, 0, 0, 0.15);
            animation: slideUp 0.7s ease forwards;
            transform: translateY(30px);
            opacity: 0;
        }

        @keyframes slideUp {
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .game-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 18px 30px rgba(0, 0, 0, 0.3);
            border-color: #6a5acd;
            outline: 2px solid #6a5acd;
        }

        .game-overlay {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 16px 12px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 60%);
            color: #fff;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
            text-align: center;
        }

        .game-code {
            font-size: 1.7rem;
            font-weight: bold;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 4px 10px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 6px;
        }

        .progress-info {
            font-size: 0.95rem;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 6px 10px;
            border-radius: 10px;
        }

        .progress-bar {
            height: 14px;
            background: #d1d5db;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 6px;
        }

        .progress-bar-fill {
            height: 100%;
            background: #6a5acd;
            width: 0;
            border-radius: 10px;
            transition: width 0.4s ease-in-out;
        }

        @media (max-width: 600px) {
            .game-list {
                flex-direction: column;
                max-width: 320px;
                gap: 20px;
            }

            .game-card {
                width: 100%;
                height: 280px;
            }

            .game-code {
                font-size: 1.4rem;
            }

            .progress-info {
                font-size: 0.9rem;
            }

            .progress-bar {
                height: 12px;
            }
        }
                footer {
            width: 100%;
            margin-top: auto;
            padding: 20px 0;
            text-align: center;
        }

        .footer-box {
            background: rgba(255, 255, 255, 0.75);
            margin: auto;
            padding: 15px 10px;
            border-radius: 15px;
            max-width: 800px;
            font-size: 0.9rem;
        }
    </style>
</head>

<body>
<div class="background-stars"></div>

<?php include '../includes/student_header.php'; ?>

<main class="container my-4 d-flex flex-column align-items-center">
    <div class="welcome">สวัสดี ยินดีต้อนรับ <?= htmlspecialchars($name) ?> 👋</div>
    <div class="game-list" role="list" aria-label="รายการแบบฝึกหัดเกม">
        <?php foreach ($games as $game_id => $game):
            $progress = getGameProgress($conn, $user_id, $game_id);
            $percent = ($progress['total'] > 0) ? round(($progress['passed'] / $progress['total']) * 100) : 0;
            $bg = "../assets/img/cards/" . $game['code'] . ".png";

            if ($game_id == 1) {
                $link = "stage_logic_1.php";
            } else {
                $link = "stage.php?game_id=$game_id&stage=1";
            }
        ?>
            <a href="<?= $link ?>" class="game-card" style="background-image: url('<?= $bg ?>');" title="<?= htmlspecialchars($game['title']) ?>">
                <div class="game-overlay">
                    <div class="game-code"><?= htmlspecialchars($game['code']) ?></div>
                    <div class="progress-info">
                        ด่านที่ทำสำเร็จ: <?= $progress['passed'] ?>/<?= $progress['total'] ?><br>
                        คะแนนรวม: <?= $progress['score'] ?>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: <?= $percent ?>%;"></div>
                        </div>
                    </div>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</main>

<?php include '../includes/student_footer.php'; ?>

</body>
</html>
