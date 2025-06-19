<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ยินดีต้อนรับ - ระบบแบบฝึกทักษะ ป.4</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(to bottom right, #a1c4fd, #c2e9fb, #fddde6);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 20px 20px;
            margin: 0;
            text-align: center;
            overflow-x: hidden;
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
            opacity: 0.4;
        }

        @keyframes stars {
            from {
                transform: translateY(0);
            }

            to {
                transform: translateY(-500px);
            }
        }

        .welcome-box {
            background: #fff9f0;
            padding: 40px 30px;
            border-radius: 24px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-width: 700px;
            width: 100%;
            border: 4px dashed #ffd166;
            position: relative;
            animation: fadeInUp 1s ease;
        }

        .welcome-box h1 {
            color: #ff6f61;
            margin-bottom: 15px;
            font-size: 2.5rem;
            animation: bounceIn 1s ease;
        }

        .welcome-box h4 {
            color: #444;
            margin-bottom: 20px;
        }

        .welcome-box p {
            font-size: 1.25rem;
            color: #333;
        }

        .btn-login {
            font-size: 1.2rem;
            padding: 14px 36px;
            background-color: #06d6a0;
            border: none;
            color: white;
            border-radius: 12px;
            animation: pulse 2s infinite;
        }

        .btn-login:hover {
            background-color: #118ab2;
        }

        .character-img {
            position: absolute;
            top: -60px;
            left: -40px;
            width: 100px;
            transform: rotate(-10deg);
            animation: floatY 3s ease-in-out infinite;
        }

        @keyframes floatY {
            0% {
                transform: translateY(0) rotate(-10deg);
            }

            50% {
                transform: translateY(-20px) rotate(-10deg);
            }

            100% {
                transform: translateY(0) rotate(-10deg);
            }
        }

        @keyframes pulse {

            0%,
            100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.05);
            }
        }

        @keyframes bounceIn {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }

            60% {
                transform: scale(1.05);
                opacity: 1;
            }

            100% {
                transform: scale(1);
            }
        }

        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }

            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

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
                transform: translate(50px, -80px) rotate(90deg);
            }

            50% {
                transform: translate(100px, 0px) rotate(180deg);
            }

            75% {
                transform: translate(50px, 80px) rotate(270deg);
            }

            100% {
                transform: translate(0, 0) rotate(360deg);
            }
        }

        .emoji1 {
            top: -30px;
            right: -30px;
        }

        .emoji2 {
            bottom: -30px;
            left: -30px;
            animation-delay: 2s;
        }

        .emoji3 {
            top: -20px;
            left: 50%;
            animation-delay: 4s;
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

        @media (max-width: 768px) {
            .welcome-box h1 {
                font-size: 2rem;
                margin-top: 40px;
            }

            .welcome-box p {
                font-size: 1rem;
            }

            .btn-login {
                font-size: 1rem;
                padding: 12px 24px;
            }

            .footer-box {
                font-size: 0.75rem;
            }
        }
    </style>
</head>

<body>

    <div class="star-bg"></div>

    <div class="welcome-box">
        <img src="assets/img/kid.webp" alt="การ์ตูนเด็ก" class="character-img" />

        <!-- อีโมจิลอยหมุน -->
        <div class="emoji-fly emoji1">🌈</div>
        <div class="emoji-fly emoji2">🪐</div>
        <div class="emoji-fly emoji3">✨</div>

        <h1>👋 สวัสดีจ้า!</h1>
        <h4>ยินดีต้อนรับสู่ระบบแบบฝึกทักษะ<br>วิทยาการคำนวณ ป.4</h4>
        <p>
            สนุกไปกับเกมฝึกสมอง 🧠<br>
            ฝึกคิด วิเคราะห์ อย่างเป็นระบบ 💡
        </p>

        <div class="mt-4">
            <a href="pages/login.php" class="btn btn-login">เริ่มเลย!</a>
        </div>
    </div>

    <audio autoplay>
        <source src="assets/sound/welcome.mp3" type="audio/mpeg">
    </audio>

    <!-- Footer -->
    <footer>
        <div class="footer-box">
            <p class="mb-1">
                พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>
                ครู โรงเรียนบ้านนาอุดม<br>
                สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร
            </p>
            <p class="text-muted mb-0">
                &copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai. All rights reserved.
            </p>
        </div>
    </footer>
</body>

</html>