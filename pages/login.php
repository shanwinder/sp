<?php
session_start();
require_once '../includes/db.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT id, student_id, name, password, role FROM users WHERE student_id = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['student_id'] = $user['student_id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];

            if ($user['role'] === 'admin') {
                header("Location: dashboard.php");
            } else {
                header("Location: student_dashboard.php");
            }
            exit();
        } else {
            $message = "❌ รหัสผ่านไม่ถูกต้อง";
        }
    } else {
        $message = "❌ ไม่พบชื่อผู้ใช้ในระบบ";
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เข้าสู่ระบบ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to bottom right, #a1c4fd, #c2e9fb, #fddde6);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin: 0;
        }

        html,
        body {
            overflow-x: hidden;
            width: 100%;
            /* ป้องกันการเลื่อนแนวนอน */
        }

        .emoji-fly {
            position: fixed;
            /* เดิม: absolute */
            font-size: 2rem;
            animation: flyRotate 10s linear infinite;
            opacity: 0.8;
            max-width: 100vw;
            pointer-events: none;
            z-index: 0;
        }



        .star-bg {
            position: fixed;
            width: 200%;
            height: 200%;
            background: radial-gradient(rgba(255, 255, 255, 0.9) 2px, transparent 2px),
                radial-gradient(rgba(255, 255, 255, 0.6) 2px, transparent 2px);
            background-size: 60px 60px;
            background-position: 0 0, 30px 30px;
            animation: stars 80s linear infinite;
            z-index: -1;
            opacity: 0.3;
        }

        @keyframes stars {
            from {
                transform: translateY(0);
            }

            to {
                transform: translateY(-500px);
            }
        }

        main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            position: relative;
        }

        .login-box {
            background: #fff9f0;
            padding: 40px 30px;
            border-radius: 20px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            border: 4px dashed #ffd166;
            position: relative;
            z-index: 10;
        }

        h2 {
            color: #ff6f61;
            margin-bottom: 25px;
            font-size: 2rem;
            text-align: center;
        }

        .btn-primary {
            background-color: #06d6a0;
            border: none;
        }

        .btn-primary:hover {
            background-color: #118ab2;
        }

        /* อีโมจิลอยหมุน */
        .emoji-fly {
            position: absolute;
            font-size: 2rem;
            animation: flyRotate 10s linear infinite;
            opacity: 0.8;
        }

        @keyframes flyRotate {
            0% {
                transform: translate(0, 0) rotate(0deg);
            }

            25% {
                transform: translate(40px, -60px) rotate(90deg);
            }

            50% {
                transform: translate(80px, 0px) rotate(180deg);
            }

            75% {
                transform: translate(40px, 60px) rotate(270deg);
            }

            100% {
                transform: translate(0, 0) rotate(360deg);
            }
        }


        .emoji1 {
            top: 20px;
            left: 20px;
            animation-delay: 0s;
            z-index: 2;
        }

        .emoji2 {
            bottom: 40px;
            right: 60px;
            animation-delay: 2s;
            z-index: 2;
        }

        .emoji3 {
            top: 100px;
            left: 60%;
            animation-delay: 4s;
            z-index: 2;
        }

        footer {
            text-align: center;
            padding: 15px 10px;
            background: rgba(255, 255, 255, 0.75);
        }

        footer div {
            max-width: 1000px;
            margin: auto;
            font-size: 0.9rem;
            border-radius: 15px;
        }
    </style>
</head>

<body>

    <div class="star-bg"></div>
    <div class="emoji-fly emoji1">🌈</div>
    <div class="emoji-fly emoji2">🪐</div>
    <div class="emoji-fly emoji3">✨</div>

    <main>
        <div class="login-box">
            <h2>เข้าสู่ระบบ</h2>

            <?php if (!empty($message)): ?>
                <div class="alert alert-warning text-center"><?php echo $message; ?></div>
            <?php endif; ?>

            <form method="post">
                <div class="mb-3">
                    <label for="username" class="form-label">ชื่อผู้ใช้ (รหัสนักเรียน)</label>
                    <input type="text" class="form-control" name="username" id="username" required autofocus>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">รหัสผ่าน</label>
                    <input type="password" class="form-control" name="password" id="password" required>
                </div>

                <button type="submit" class="btn btn-primary w-100">🎮 เข้าสู่ระบบ</button>
            </form>
        </div>
    </main>

    <footer>
        <div>
            <p class="mb-1">พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>
                ครู โรงเรียนบ้านนาอุดม<br>
                สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร</p>
            <p class="text-muted mb-0">&copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai. All rights
                reserved.</p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>