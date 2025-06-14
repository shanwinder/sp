<?php
// เริ่ม session ถ้ายังไม่ได้เริ่ม
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
  <meta charset="UTF-8">
  <title>ระบบแบบฝึกทักษะวิทยาการคำนวณ ป.4</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">

  <!-- Google Fonts (Kanit) -->
  <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet">

  <!-- Custom CSS -->
  <link rel="stylesheet" href="../assets/css/style.css">

  <!-- Favicon (ถ้ามี) -->
  <link rel="icon" type="image/png" href="../assets/img/favicon.png">

  <style>
    body {
      font-family: 'Kanit', sans-serif;
      background: linear-gradient(to right, #e0f2fe, #fef9c3);
      min-height: 100vh;
    }

    .navbar {
      background-color: #f59e0b;
    }

    .navbar-brand,
    .nav-link {
      color: white !important;
      font-weight: bold;
    }

    .navbar-brand:hover,
    .nav-link:hover {
      text-decoration: underline;
    }
  </style>
</head>

<body>
  <!-- Navbar ส่วนบน -->
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <a class="navbar-brand" href="../pages/dashboard.php">📚 แบบฝึกทักษะวิทยาการคำนวณ ป.4</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                <li class="nav-item">
      <span class="nav-link text-white">👤 <?php echo htmlspecialchars($_SESSION['name']); ?> (แอดมิน)</span>
    </li>
            <li class="nav-item">
              <a class="nav-link" href="../logout.php">ออกจากระบบ</a>
            </li>
          <?php elseif (isset($_SESSION['role']) && $_SESSION['role'] === 'student'): ?>
                <li class="nav-item">
      <span class="nav-link text-white">👤 <?php echo htmlspecialchars($_SESSION['name']); ?></span>
    </li>
            <li class="nav-item">
              <a class="nav-link" href="../pages/dashboard.php">แดชบอร์ด</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="../logout.php">ออกจากระบบ</a>
            </li>
          <?php else: ?>
            <li class="nav-item">
              <a class="nav-link" href="../pages/login.php">เข้าสู่ระบบ</a>
            </li>
          <?php endif; ?>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container mt-4">