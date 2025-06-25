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

    if (empty($stage_ids))
        return ['passed' => 0, 'total' => 0, 'score' => 0];

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
        'passed' => (int) $progress['passed'],
        'total' => $total,
        'score' => (int) $progress['score']
    ];
}
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8" />
    <title>แดชบอร์ดนักเรียน</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
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
            overflow: hidden;
            z-index: -1;
            pointer-events: none;
        }

        .star-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            background-repeat: repeat;
            background-size: 200% 200%;
            /* opacity: 100; ค่านี้ไม่ได้มีผลเพราะถูกทับด้วย opacity ในแต่ละ layer- */
            animation: moveStars 120s linear infinite;
        }

        .star-layer::before,
        .star-layer::after {
            content: '';
            position: absolute;
            /* เพิ่มขนาดดาวเป็น 3px ให้เห็นชัดขึ้น */
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            box-shadow:
                /* เพิ่มจำนวนดาวและกระจายตำแหน่งให้มากขึ้น */
                100px 200px white, 150px 350px white, 200px 150px white,
                50px 500px white, 300px 100px white, 400px 300px white,
                250px 400px white, 600px 150px white, 500px 250px white,
                700px 50px white, 800px 450px white, 120px 600px white,
                350px 70px white, 900px 200px white, 100px 800px white,
                550px 550px white, 200px 700px white, 450px 120px white,
                750px 650px white, 950px 350px white, 50px 250px white,
                850px 100px white, 250px 900px white, 650px 400px white,
                150px 50px white, 300px 850px white, 700px 700px white,
                400px 20px white, 900px 500px white,
                100px 100px white, 200px 600px white, 700px 900px white, 850px 50px white;
            /* เพิ่มดาวอีก */
            animation: twinkle 2s infinite ease-in-out alternate;
        }

        .star-layer.layer-1 {
            transform: translateZ(0);
            animation-duration: 60s;
            opacity: 0.9;
            /* เพิ่มความชัดเจน */
        }

        .star-layer.layer-2 {
            transform: translateZ(-1px) scale(1.5);
            animation-duration: 120s;
            opacity: 0.7;
            /* เพิ่มความชัดเจน */
        }

        .star-layer.layer-3 {
            transform: translateZ(-2px) scale(2);
            animation-duration: 180s;
            opacity: 0.5;
            /* เพิ่มความชัดเจน */
        }

        @keyframes moveStars {
            0% {
                background-position: 0 0;
            }

            100% {
                background-position: 1000px 1000px;
            }
        }

        @keyframes twinkle {
            0% {
                opacity: 0.2;
            }

            50% {
                opacity: 1;
            }

            100% {
                opacity: 0.2;
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
            border: 4px solid rgba(255, 255, 255, 0.3);
            outline: 1px solid rgba(0, 0, 0, 0.15);
            /* ใช้ animation สำหรับการโหลดครั้งแรกเท่านั้น */
            animation: slideUp 0.7s ease forwards;
            /* กำหนด transition สำหรับการ hover */
            transition: transform 0.3s ease-out, box-shadow 0.3s ease, border-color 0.3s ease;
            transform-style: preserve-3d;
            /* สำหรับการหมุน 3D ในอนาคต (ถ้ามี) */
        }

        @keyframes slideUp {
            0% {
                transform: translateY(30px);
                opacity: 0;
            }

            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .game-card:hover {
            /* แอนิเมชันสำหรับ hover */
            transform: translateY(-20px) rotate(-5deg) scale(1.08);
            /* เลื่อนขึ้น หมุนเล็กน้อย และขยาย */
            box-shadow: 0 20px 35px rgba(0, 0, 0, 0.4);
            border-color: rgb(124, 104, 255);
            outline: 2px solidrgb(124, 104, 255);
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
            background: rgb(75, 165, 2);
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

        /* ลบ @keyframes bounceInHover; ทิ้งไป เพราะไม่ได้ใช้แล้ว */
    </style>
</head>

<body>
    <div class="background-stars">
        <div class="star-layer layer-1"></div>
        <div class="star-layer layer-2"></div>
        <div class="star-layer layer-3"></div>
    </div>


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
                <a href="<?= $link ?>" class="game-card" style="background-image: url('<?= $bg ?>');"
                    title="<?= htmlspecialchars($game['title']) ?>">

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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>