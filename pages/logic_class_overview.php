<?php
/* =============================================================================
   pages/logic_class_overview.php — สรุปภาพรวมชั้นเรียน (ครู)
   แหล่งข้อมูล: progress(id, user_id, stage_id, score, duration_seconds, attempts)
   คะแนนเต็ม 3 ต่อด่าน → percent = (score/3)*100 (0..100)
   แสดงกราฟ: คะแนนเฉลี่ย/ด่าน, เวลาเฉลี่ย/ด่าน, ความพยายามเฉลี่ย/ด่าน
   ============================================================================ */

if (session_status() === PHP_SESSION_NONE) session_start();

$BASE_DIR = dirname(__DIR__);              // …/sp
require_once $BASE_DIR . '/includes/auth.php';
require_once $BASE_DIR . '/includes/db.php';

// ---------- สิทธิ์เข้าถึง ----------
if (function_exists('requireTeacher')) {
  requireAdmin();
} else {
  $role = $_SESSION['role'] ?? '';
  if (!in_array($role, ['teacher','admin','staff'], true)) {
    header("Location: ../pages/login.php"); // ใช้เส้นทางเว็บ ไม่ใช่ path ไฟล์
    exit;
  }
}

const FULL_SCORE_PER_STAGE = 3;
$SITE_TITLE  = 'Admin dashboard • ภาพรวมแบบฝึกทักษะเหตุผลเชิงตรรกะ';
$teacherName = $_SESSION['display_name']
  ?? $_SESSION['full_name']
  ?? $_SESSION['name']
  ?? $_SESSION['username']
  ?? 'ครู';

// ---------- ฟังก์ชันยูทิล ----------
function table_exists(mysqli $conn, string $name): bool {
  // ทางหลัก: INFORMATION_SCHEMA (prepare ได้)
  $sql = "SELECT COUNT(*) AS c
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?";
  if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param('s', $name);
    if ($stmt->execute()) {
      $res = $stmt->get_result();
      $ok  = (int)($res->fetch_assoc()['c'] ?? 0) > 0;
      $stmt->close();
      return $ok;
    }
    $stmt->close();
  }
  // ทางสำรอง: SHOW TABLES (แบบ escape ธรรมดา)
  $esc = $conn->real_escape_string($name);
  $res = $conn->query("SHOW TABLES LIKE '{$esc}'");
  return (bool)($res && $res->num_rows);
}

$hasUsers    = table_exists($conn, 'users');
$hasProgress = table_exists($conn, 'progress');
if (!$hasProgress) {
  http_response_code(500);
  echo "<h3 style='font-family:sans-serif'>ไม่พบตาราง <code>progress</code> — จำเป็นต้องมีตารางนี้</h3>";
  exit;
}

// เดา field ของ users สำหรับ role/ชั้นเรียน
$roleCol = null; $classCol = null; $classOptions = [];
if ($hasUsers) {
  $cols = [];
  $q = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='users'";
  if ($res = $conn->query($q)) while ($r = $res->fetch_assoc()) $cols[] = $r['COLUMN_NAME'];

  if (in_array('role', $cols, true)) $roleCol = 'role';
  foreach (['classroom','class','room','section','class_name','grade_section','homeroom'] as $c) {
    if (in_array($c, $cols, true)) { $classCol = $c; break; }
  }

  if ($classCol) {
    $sqlCls = "SELECT DISTINCT $classCol AS c FROM users";
    $where  = [];
    if ($roleCol) $where[] = "$roleCol='student'";
    if ($where)   $sqlCls .= " WHERE " . implode(' AND ', $where);
    $sqlCls .= " ORDER BY c ASC";
    if ($rs = $conn->query($sqlCls)) {
      while ($x = $rs->fetch_assoc()) {
        $c = trim((string)$x['c']);
        if ($c !== '') $classOptions[] = $c;
      }
    }
  }
}
$selClass = isset($_GET['class']) ? trim($_GET['class']) : '';

// ---------- ดึง “ผลล่าสุดต่อด่าน/ต่อคน” ----------
$params = []; $types = '';
$joinUsers = $hasUsers ? "JOIN users u ON u.id = p.user_id" : "";
$whereUser = [];
if ($hasUsers && $roleCol) {
  $whereUser[] = "u.$roleCol = 'student'";
}
if ($hasUsers && $classCol && $selClass !== '') {
  $whereUser[] = "u.$classCol = ?";
  $types .= 's'; $params[] = $selClass;
}
$filterUserSQL = $whereUser ? (" WHERE " . implode(' AND ', $whereUser)) : "";

$sqlLatest = "
  SELECT p.stage_id, p.user_id, p.score, p.duration_seconds, p.attempts
  FROM progress p
  JOIN (
    SELECT user_id, stage_id, MAX(id) AS max_id
    FROM progress
    GROUP BY user_id, stage_id
  ) t ON p.id = t.max_id
  $joinUsers
  $filterUserSQL
  ORDER BY p.stage_id ASC
";

$rows = [];
$stmt = $conn->prepare($sqlLatest);
if ($stmt) {
  if ($types) $stmt->bind_param($types, ...$params);
  $stmt->execute();
  $rs = $stmt->get_result();
  while ($r = $rs->fetch_assoc()) {
    $rows[] = [
      'stage_id' => (int)$r['stage_id'],
      'user_id'  => (int)$r['user_id'],
      'score'    => (float)$r['score'],
      'seconds'  => isset($r['duration_seconds']) ? (int)$r['duration_seconds'] : null,
      'attempts' => isset($r['attempts']) ? (int)$r['attempts'] : null,
    ];
  }
  $stmt->close();
} else {
  // fallback แบบไม่มี filter class (กรณี prepare ล้มเหลวด้วยเหตุอื่น)
  $sqlFallback = "
    SELECT p.stage_id, p.user_id, p.score, p.duration_seconds, p.attempts
    FROM progress p
    JOIN (
      SELECT user_id, stage_id, MAX(id) AS max_id
      FROM progress
      GROUP BY user_id, stage_id
    ) t ON p.id = t.max_id
    ORDER BY p.stage_id ASC
  ";
  if ($rs = $conn->query($sqlFallback)) {
    while ($r = $rs->fetch_assoc()) {
      $rows[] = [
        'stage_id' => (int)$r['stage_id'],
        'user_id'  => (int)$r['user_id'],
        'score'    => (float)$r['score'],
        'seconds'  => isset($r['duration_seconds']) ? (int)$r['duration_seconds'] : null,
        'attempts' => isset($r['attempts']) ? (int)$r['attempts'] : null,
      ];
    }
  }
}

// ---------- รวมเป็นภาพรวมรายด่าน ----------
$stageAgg = [];      // sid => sums & counts
$allStudentIds = [];
foreach ($rows as $r) {
  $sid = $r['stage_id']; $uid = $r['user_id'];
  if (!isset($stageAgg[$sid])) $stageAgg[$sid] = ['sumPct'=>0,'nPct'=>0,'sumSec'=>0,'nSec'=>0,'sumAtt'=>0,'nAtt'=>0,'users'=>[]];

  $pct = FULL_SCORE_PER_STAGE > 0 ? max(0, min(100, ($r['score']/FULL_SCORE_PER_STAGE)*100.0)) : 0;
  $stageAgg[$sid]['sumPct'] += $pct;                  $stageAgg[$sid]['nPct'] += 1;
  if (!is_null($r['seconds']))  { $stageAgg[$sid]['sumSec'] += max(0, (int)$r['seconds']);  $stageAgg[$sid]['nSec'] += 1; }
  if (!is_null($r['attempts'])) { $stageAgg[$sid]['sumAtt'] += max(0, (int)$r['attempts']); $stageAgg[$sid]['nAtt'] += 1; }

  $stageAgg[$sid]['users'][$uid] = true;
  $allStudentIds[$uid] = true;
}
$totalStudentsWithData = count($allStudentIds);

// นับนักเรียนทั้งหมดในขอบเขต (ถ้ามี users)
$totalStudentsEligible = null;
if ($hasUsers) {
  $w = [];
  if ($roleCol) $w[] = "$roleCol='student'";
  if ($classCol && $selClass !== '') $w[] = "$classCol = ?";
  $sqlEligible = "SELECT COUNT(*) AS c FROM users" . ($w ? " WHERE ".implode(' AND ', $w) : "");
  if ($stmt = $conn->prepare($sqlEligible)) {
    if ($classCol && $selClass !== '') $stmt->bind_param('s', $selClass);
    $stmt->execute();
    $res = $stmt->get_result();
    $totalStudentsEligible = (int)($res->fetch_assoc()['c'] ?? 0);
    $stmt->close();
  }
}

// เตรียมข้อมูลกราฟ
ksort($stageAgg);
$labels = []; $avgPct = []; $avgSec = []; $avgAtt = []; $coverage = [];
foreach ($stageAgg as $sid => $ag) {
  $labels[] = "ด่าน $sid";
  $avgPct[] = $ag['nPct'] ? round($ag['sumPct']/$ag['nPct'], 2) : 0;
  $avgSec[] = $ag['nSec'] ? round($ag['sumSec']/$ag['nSec'], 2) : 0;
  $avgAtt[] = $ag['nAtt'] ? round($ag['sumAtt']/$ag['nAtt'], 2) : 0;
  if (!is_null($totalStudentsEligible) && $totalStudentsEligible > 0) {
    $coverage[] = round((count($ag['users']) / $totalStudentsEligible) * 100, 1);
  } else {
    $coverage[] = null;
  }
}
$overallAvgPct = !empty($avgPct) ? round(array_sum($avgPct)/count($avgPct), 2) : null;
?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($SITE_TITLE) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root{ --brand1:#6f9cff; --brand2:#ffd166; --brand3:#06d6a0; --brand4:#f78c6b; --brand5:#cdb4db; --ink:#1f3f68; }
    body{ background: linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #fff9f3 100%); }
    .navbar{ background: linear-gradient(90deg, #ffffff 0%, #f8fbff 100%) !important; }
    .brand-title{ font-weight:700; color:var(--ink); }
    .user-pill{ background:#eef5ff; color:#0f172a; border-radius:999px; padding:.25rem .75rem; font-weight:600; display:inline-flex; align-items:center; gap:.5rem; }
    .user-avatar{ width:26px; height:26px; border-radius:50%; background:#6f9cff; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:.9rem; font-weight:700; }
    .hero{ background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:18px; box-shadow:0 8px 20px rgba(31,63,104,.08); padding:16px 18px; }
    .section-card{ border:none; border-radius:18px; box-shadow:0 8px 20px rgba(31,63,104,.08); }
    .section-card .card-header{ background:#fff; border-bottom:1px solid rgba(0,0,0,.06); font-weight:700; color:var(--ink); border-top-left-radius:18px; border-top-right-radius:18px; }
    .metric{ border-radius:14px; padding:14px; background:#f9fbff; border:1px solid rgba(0,0,0,.05); }
    .metric .val{ font-size:1.4rem; font-weight:800; color:var(--ink); }
    .badge-soft{ background:#eef5ff; color:#0f172a; border:1px solid rgba(0,0,0,.05); }
    footer.site-footer{ border-top:1px solid rgba(0,0,0,.06); background:#fff; }
  </style>
</head>
<body>

<nav class="navbar navbar-expand-lg border-bottom sticky-top">
  <div class="container">
    <span class="navbar-brand brand-title"><?= htmlspecialchars($SITE_TITLE) ?></span>
    <div class="ms-auto d-flex align-items-center gap-2">
      <span class="user-pill">
        <span class="user-avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($teacherName,0,1,'UTF-8'),'UTF-8')) ?></span>
        <span class="d-none d-sm-inline"><?= htmlspecialchars($teacherName) ?></span>
      </span>
    </div>
  </div>
</nav>

<div class="container my-4">

  <div class="hero mb-3">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
        <h4 class="mb-0">สรุปภาพรวมแบบฝึกทักษะเหตุผลเชิงตรรกะ</h4>
        <div class="text-muted small">คิดคะแนนเป็นร้อยละจากคะแนนเต็ม <?= FULL_SCORE_PER_STAGE ?> ต่อด่าน</div>
      </div>
      <?php if ($classCol && !empty($classOptions)): ?>
      <form method="get" class="d-flex align-items-center gap-2">
        <label class="small text-muted">ห้อง/ชั้น:</label>
        <select name="class" class="form-select form-select-sm" onchange="this.form.submit()">
          <option value="">— ทั้งหมด —</option>
          <?php foreach ($classOptions as $c): ?>
            <option value="<?= htmlspecialchars($c) ?>" <?= $selClass===$c?'selected':'' ?>>
              <?= htmlspecialchars($c) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </form>
      <?php endif; ?>
    </div>
  </div>

  <?php if (empty($rows)): ?>
    <div class="alert alert-secondary">ยังไม่พบข้อมูลใน <code>progress</code> สำหรับขอบเขตที่เลือก</div>
  <?php else: ?>

    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">นักเรียนที่มีข้อมูล</div>
          <div class="val"><?= (int)count($allStudentIds) ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">นักเรียนทั้งหมดในขอบเขต</div>
          <div class="val"><?= is_null($totalStudentsEligible)?'–':(int)$totalStudentsEligible ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">ค่าเฉลี่ยคะแนนรวม (%)</div>
          <div class="val"><?= is_null($overallAvgPct)?'–':$overallAvgPct ?></div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">จำนวนด่านที่มีข้อมูล</div>
          <div class="val"><?= count($labels) ?></div>
        </div>
      </div>
    </div>

    <div class="card section-card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>คะแนนเฉลี่ยต่อด่าน (ร้อยละ)</span>
        <?php if (!empty(array_filter($coverage, fn($x)=>!is_null($x)))): ?>
          <span class="small text-muted">• ตัวเลขใต้แท่ง = Coverage % (นักเรียนที่มีข้อมูล/นักเรียนทั้งหมด)</span>
        <?php endif; ?>
      </div>
      <div class="card-body">
        <canvas id="chartScore" height="120"></canvas>
        <?php if (!empty(array_filter($coverage, fn($x)=>!is_null($x)))): ?>
        <div id="scoreCoverage" class="d-flex gap-2 justify-content-center small mt-2"></div>
        <?php endif; ?>
      </div>
    </div>

    <div class="card section-card mb-3">
      <div class="card-header">เวลาเฉลี่ยต่อด่าน (วินาที)</div>
      <div class="card-body"><canvas id="chartTime" height="120"></canvas></div>
    </div>

    <div class="card section-card mb-3">
      <div class="card-header">ความพยายามเฉลี่ยต่อด่าน (ครั้ง)</div>
      <div class="card-body"><canvas id="chartAttempts" height="120"></canvas></div>
    </div>

    <div class="card section-card">
      <div class="card-header">รายละเอียดต่อด่าน</div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>ด่าน</th>
                <th class="text-end">คะแนนเฉลี่ย (%)</th>
                <th class="text-end">เวลาเฉลี่ย (วินาที)</th>
                <th class="text-end">ความพยายามเฉลี่ย (ครั้ง)</th>
                <th class="text-end">Coverage (%)</th>
              </tr>
            </thead>
            <tbody>
              <?php for($i=0; $i<count($labels); $i++): ?>
              <tr>
                <td><?= htmlspecialchars($labels[$i]) ?></td>
                <td class="text-end"><?= number_format((float)$avgPct[$i], 2) ?></td>
                <td class="text-end"><?= number_format((float)$avgSec[$i], 2) ?></td>
                <td class="text-end"><?= number_format((float)$avgAtt[$i], 2) ?></td>
                <td class="text-end"><?= is_null($coverage[$i]) ? '–' : number_format((float)$coverage[$i], 1) ?></td>
              </tr>
              <?php endfor; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  <?php endif; ?>
</div>

<?php
$FOOT = $BASE_DIR . '/includes/student_footer.php';
if (is_file($FOOT)) { include $FOOT; }
else { echo '<footer class="site-footer py-4 mt-5"><div class="container small text-muted">© '.date('Y').' • Class Overview (Logic)</div></footer>'; }
?>

<script>
(function(){
  const labels = <?= json_encode($labels, JSON_UNESCAPED_UNICODE) ?>;
  const avgPct = <?= json_encode($avgPct) ?>;
  const avgSec = <?= json_encode($avgSec) ?>;
  const avgAtt = <?= json_encode($avgAtt) ?>;
  const cov    = <?= json_encode($coverage) ?>;

  const C1='rgba(111,156,255,0.9)', C2='rgba(6,214,160,0.9)', C3='rgba(205,180,219,0.9)';

  function mk(id){ const el=document.getElementById(id); return el?el.getContext('2d'):null; }

  const g1 = mk('chartScore');
  if (g1) new Chart(g1, {
    type:'bar',
    data:{ labels, datasets:[{ label:'คะแนนเฉลี่ย (%)', data: avgPct, backgroundColor: C1 }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } }, plugins:{ legend:{ display:false } } }
  });

  const covEl = document.getElementById('scoreCoverage');
  if (covEl && cov && cov.length) {
    cov.forEach((v,i)=>{
      const chip = document.createElement('div');
      chip.className = 'badge badge-soft';
      chip.style.fontSize = '12px';
      chip.textContent = labels[i] + ': ' + (v===null ? '–' : (v.toFixed(1)+'%'));
      covEl.appendChild(chip);
    });
  }

  const g2 = mk('chartTime');
  if (g2) new Chart(g2, {
    type:'bar',
    data:{ labels, datasets:[{ label:'เวลาเฉลี่ย (วินาที)', data: avgSec, backgroundColor: C2 }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ display:false } } }
  });

  const g3 = mk('chartAttempts');
  if (g3) new Chart(g3, {
    type:'bar',
    data:{ labels, datasets:[{ label:'ความพยายามเฉลี่ย (ครั้ง)', data: avgAtt, backgroundColor: C3 }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ display:false } } }
  });
})();
</script>
</body>
</html>
