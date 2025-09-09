<?php
/* =========================================================================
   logic_debrief.php — สรุป/อภิปรายผลด่านตรรกะ (ใช้ progress เท่านั้น)
   แสดงกราฟ: คะแนนต่อด่าน(%) ระยะเวลา(วินาที) ความพยายาม(ครั้ง)
   สมมติ schema: progress(id, user_id, stage_id, score, duration_seconds, attempts)
   คะแนนเต็ม: 3 ต่อด่าน → percent = (score/3)*100
   ต้องมี: ../includes/auth.php (requireStudent), ../includes/db.php ($conn)
   UI: Bootstrap 5 + Chart.js (CDN)
   ========================================================================= */
if (session_status() === PHP_SESSION_NONE) session_start();

$BASE = __DIR__;
require_once $BASE . '/../includes/auth.php';
require_once $BASE . '/../includes/db.php';
requireStudent(); // ต้องเป็นนักเรียนล็อกอิน

// ---------- ค่าคงที่ ----------
const FULL_SCORE_PER_STAGE = 3;

// ---------- ข้อมูลผู้ใช้/ชื่อ ----------
$SITE_TITLE = 'แบบฝึกทักษะวิทยาการคำนวณ ป.4';
$userId = (int)($_SESSION['user_id'] ?? 0);

$studentName =
  $_SESSION['display_name']
  ?? $_SESSION['full_name']
  ?? $_SESSION['student_name']
  ?? $_SESSION['name']          // คุณใช้ key นี้หลายหน้า
  ?? $_SESSION['username']
  ?? 'นักเรียน';

$initial = mb_strtoupper(mb_substr($studentName,0,1,'UTF-8'),'UTF-8');

$fromStage = $_GET['from'] ?? '';

// ---------- หา URL แดชบอร์ดที่ถูกต้อง ----------
function findDashboardUrl(string $base): string {
  $candidates = [
    '../pages/student_dashboard.php','pages/student_dashboard.php',
    '../student_dashboard.php','student_dashboard.php',
    '../dashboard.php','dashboard.php',
    '../index.php','index.php',
  ];
  foreach ($candidates as $rel) {
    if (is_file($base . '/' . $rel)) return $rel;
  }
  if (!empty($_SESSION['dashboard_url'])) return (string)$_SESSION['dashboard_url'];
  return 'index.php';
}
$dashboardUrl = findDashboardUrl($BASE);

// ---------- ตรวจว่ามีตาราง progress ----------
$hasProgress = false;
if ($st = $conn->prepare("SHOW TABLES LIKE 'progress'")) {
  $st->execute();
  $hasProgress = (bool)$st->get_result()->fetch_row();
  $st->close();
}

// ---------- ดึง "แถวล่าสุดต่อด่าน" ของผู้ใช้จาก progress ----------
$rows = [];
if ($hasProgress) {
  $sql = "
    SELECT p.stage_id, p.score, p.duration_seconds, p.attempts
    FROM progress p
    INNER JOIN (
      SELECT stage_id, MAX(id) AS max_id
      FROM progress
      WHERE user_id = ?
      GROUP BY stage_id
    ) t ON p.id = t.max_id
    ORDER BY p.stage_id ASC
  ";
  if ($st = $conn->prepare($sql)) {
    $st->bind_param('i', $userId);
    $st->execute();
    $rs = $st->get_result();
    while ($r = $rs->fetch_assoc()) {
      $rows[] = [
        'stage_id' => (int)$r['stage_id'],
        'score'    => (float)$r['score'],
        'seconds'  => isset($r['duration_seconds']) ? (int)$r['duration_seconds'] : null,
        'attempts' => isset($r['attempts']) ? (int)$r['attempts'] : null,
      ];
    }
    $st->close();
  }
}

// ---------- เตรียมข้อมูลสำหรับกราฟ/สรุป ----------
$labels = [];
$percentScores = [];
$timePerStage = [];
$attemptsPerStage = [];

$totalAttempts = 0;
$totalSeconds = 0;
$cntSeconds = 0;

foreach ($rows as $r) {
  $labels[] = 'ด่าน ' . $r['stage_id'];
  // คิดเป็นร้อยละจากคะแนนเต็ม 3
  $pct = FULL_SCORE_PER_STAGE > 0 ? min(100, max(0, round(($r['score'] / FULL_SCORE_PER_STAGE) * 100, 2))) : 0;
  $percentScores[] = $pct;

  $sec = $r['seconds'];
  $timePerStage[] = is_null($sec) ? 0 : max(0, (int)$sec);
  if (!is_null($sec)) { $totalSeconds += (int)$sec; $cntSeconds++; }

  $att = $r['attempts'];
  $attemptsPerStage[] = is_null($att) ? 0 : max(0, (int)$att);
  if (!is_null($att)) $totalAttempts += (int)$att;
}

// สรุปภาพรวม
$avgPercent = !empty($percentScores) ? round(array_sum($percentScores)/count($percentScores), 2) : null;
$avgSeconds = $cntSeconds > 0 ? round($totalSeconds / $cntSeconds, 2) : null;

?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>สรุปและอภิปรายแบบฝึกทักษะเหตุผลเชิงตรรกะ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    :root{
      --brand1:#6f9cff; --brand2:#ffd166; --brand3:#06d6a0; --brand4:#f78c6b; --brand5:#cdb4db; --ink:#1f3f68;
    }
    body{ background: linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #fff9f3 100%); }
    .navbar{ background: linear-gradient(90deg, #ffffff 0%, #f8fbff 100%) !important; }
    .brand-title{ font-weight:700; color:var(--ink); }
    .user-pill{ background:#eef5ff; color:var(--ink); border-radius:999px; padding:.25rem .75rem; font-weight:600; display:inline-flex; align-items:center; gap:.5rem; }
    .user-avatar{ width:26px; height:26px; border-radius:50%; background:#6f9cff; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:.9rem; font-weight:700; }
    .hero{ background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:18px; box-shadow: 0 8px 20px rgba(31,63,104,.08); padding:16px 18px; }
    .section-card{ border:none; border-radius:18px; box-shadow: 0 8px 20px rgba(31,63,104,.08); }
    .section-card .card-header{ background:#fff; border-bottom:1px solid rgba(0,0,0,.06); font-weight:700; color:var(--ink);
      border-top-left-radius:18px; border-top-right-radius:18px; }
    .metric{ border-radius:14px; padding:14px; background:#f9fbff; border:1px solid rgba(0,0,0,.05); }
    .metric .val{ font-size:1.4rem; font-weight:800; color:var(--ink); }
    footer.site-footer{ border-top: 1px solid rgba(0,0,0,.06); background:#fff; }
    .badge-soft{ background:#eef5ff; color:#0f172a; border:1px solid rgba(0,0,0,.05); }
  </style>
</head>
<body>

<nav class="navbar navbar-expand-lg border-bottom sticky-top">
  <div class="container">
    <span class="navbar-brand brand-title"><?= htmlspecialchars($SITE_TITLE) ?></span>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a class="btn btn-outline-secondary btn-sm" href="<?= htmlspecialchars($dashboardUrl) ?>">← แดชบอร์ด</a>
      <span class="user-pill">
        <span class="user-avatar"><?= htmlspecialchars($initial) ?></span>
        <span class="d-none d-sm-inline"><?= htmlspecialchars($studentName) ?></span>
      </span>
    </div>
  </div>
</nav>

<div class="container my-4">

  <?php if ($fromStage === 'stage5'): ?>
    <div class="alert alert-info mb-3">
      เยี่ยมมาก! ผ่านด่านที่ 5 แล้ว—นี่คือสรุปผลล่าสุดของคุณ เพื่อใช้พูดคุย/อภิปรายกับครูและเพื่อน
    </div>
  <?php endif; ?>

  <div class="hero mb-4">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div>
        <h4 class="mb-0">สรุปผลแบบฝึกทักษะเหตุผลเชิงตรรกะ</h4>
        <div class="text-muted small">
          คะแนนคิดเป็นร้อยละจากคะแนนเต็ม <?= FULL_SCORE_PER_STAGE ?> ต่อด่าน
        </div>
      </div>
      <div>
        <span class="badge badge-soft me-1">ตรรกะ/ลำดับรูปแบบ</span>
        <span class="badge badge-soft">GBL</span>
      </div>
    </div>
  </div>

  <?php if (!$hasProgress): ?>
    <div class="alert alert-warning">
      <strong>ไม่พบตาราง <code>progress</code></strong> โปรดตรวจสอบฐานข้อมูล
    </div>
  <?php elseif (empty($rows)): ?>
    <div class="alert alert-secondary">
      ยังไม่พบข้อมูลใน <code>progress</code> สำหรับผู้ใช้รายนี้
      <div class="mt-2">
        <a href="<?= htmlspecialchars($dashboardUrl) ?>" class="btn btn-outline-secondary btn-sm">← กลับแดชบอร์ด</a>
      </div>
    </div>
  <?php else: ?>

    <!-- Metrics -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">จำนวนด่านที่มีบันทึกล่าสุด</div>
          <div class="val"><?= count($rows) ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">ค่าเฉลี่ยคะแนน (%)</div>
          <div class="val"><?= is_null($avgPercent) ? '–' : $avgPercent ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">เวลาเฉลี่ยต่อด่าน (วินาที)</div>
          <div class="val"><?= is_null($avgSeconds) ? '–' : $avgSeconds ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">ความพยายามรวม (ครั้ง)</div>
          <div class="val"><?= (int)$totalAttempts ?></div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="card section-card mb-3">
      <div class="card-header">คะแนนต่อด่าน (คิดเป็นร้อยละจากเต็ม <?= FULL_SCORE_PER_STAGE ?>)</div>
      <div class="card-body">
        <canvas id="chartScore" height="120"></canvas>
      </div>
    </div>

    <div class="card section-card mb-3">
      <div class="card-header">ระยะเวลาที่ใช้ต่อด่าน (วินาที)</div>
      <div class="card-body">
        <canvas id="chartTime" height="120"></canvas>
      </div>
    </div>

    <div class="card section-card mb-3">
      <div class="card-header">ความพยายามต่อด่าน (attempts)</div>
      <div class="card-body">
        <canvas id="chartAttempts" height="120"></canvas>
      </div>
    </div>

    <div class="card section-card mt-3">
      <div class="card-header">แนวทางสรุป & อภิปรายชั้นเรียน</div>
      <div class="card-body">
        <ul class="mb-2">
          <li><strong>ด่านไหนคะแนนสูง/ต่ำ?</strong> วางนิยามการทำซ้ำ และกฎการเปลี่ยนแปลงให้ชัด</li>
          <li><strong>ด่านไหนใช้เวลานาน?</strong> มีขั้นย่อยเยอะ หรือผู้เรียนทดลองกฎหลากหลายก่อนยึดกฎเดียว</li>
          <li><strong>ด่านไหนพยายามหลายครั้ง?</strong> สะท้อนจุดที่ควรชี้แนะวิธีคิด เช่น การแบ่งตำแหน่ง/เขียนกำกับ</li>
        </ul>
      </div>
    </div>

    <div class="mt-3">
      <a class="btn btn-outline-secondary" href="<?= htmlspecialchars($dashboardUrl) ?>">← กลับแดชบอร์ด</a>
    </div>

  <?php endif; ?>
</div>

<?php
// Footer (ถ้ามี)
$FOOT = $BASE . '/../includes/student_footer.php';
if (is_file($FOOT)) {
  include $FOOT;
} else {
  echo '<footer class="site-footer py-4 mt-5"><div class="container small text-muted">© '.date('Y').' • Game-Based Learning (Logic) • Summary & Debrief</div></footer>';
}
?>

<script>
(function(){
  <?php if ($hasProgress && !empty($rows)): ?>
  const labels         = <?= json_encode($labels, JSON_UNESCAPED_UNICODE) ?>;
  const percentScores  = <?= json_encode($percentScores) ?>;
  const timePerStage   = <?= json_encode($timePerStage) ?>;
  const attemptsPer    = <?= json_encode($attemptsPerStage) ?>;

  const C1='rgba(111,156,255,0.9)', C2='rgba(6,214,160,0.9)', C3='rgba(205,180,219,0.9)';

  const mk = id => { const el=document.getElementById(id); return el?el.getContext('2d'):null; };

  // 1) คะแนนต่อด่าน (%)
  const s1 = mk('chartScore');
  if (s1) new Chart(s1, {
    type:'bar',
    data:{ labels, datasets:[{ label:'คะแนน (%)', data: percentScores, backgroundColor: C1 }] },
    options:{ responsive:true,
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } },
      plugins:{ legend:{ display:false } }
    }
  });

  // 2) เวลา (วินาที)
  const s2 = mk('chartTime');
  if (s2) new Chart(s2, {
    type:'bar',
    data:{ labels, datasets:[{ label:'เวลา (วินาที)', data: timePerStage, backgroundColor: C2 }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
  });

  // 3) ความพยายาม (ครั้ง)
  const s3 = mk('chartAttempts');
  if (s3) new Chart(s3, {
    type:'bar',
    data:{ labels, datasets:[{ label:'ความพยายาม (ครั้ง)', data: attemptsPer, backgroundColor: C3 }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
  });
  <?php endif; ?>
})();
</script>
</body>
</html>
