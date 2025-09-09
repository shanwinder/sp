<?php
/* =============================================================================
   pages/pretest_overview.php — สรุปผลแบบทดสอบก่อนเรียน (แดชบอร์ดแอดมิน)
   แหล่งข้อมูล: questions, choices, test_attempts, test_answers, users
   แนวคิด: ใช้ "attempt ล่าสุด/คน" เฉพาะ test_type='pre'
   โฮสต์ฟรีพร้อม: เลี่ยง get_result(), เลี่ยง INFORMATION_SCHEMA ที่ไม่จำเป็น
   ========================================================================== */

if (session_status() === PHP_SESSION_NONE) session_start();

$BASE_DIR = dirname(__DIR__); // …/sp
require_once $BASE_DIR . '/includes/auth.php';
require_once $BASE_DIR . '/includes/db.php';

// ---------- สิทธิ์เข้าถึง ----------
if (function_exists('requireAdmin')) {
  requireAdmin();
} else {
  $role = $_SESSION['role'] ?? '';
  if ($role !== 'admin') {
    header("Location: ../pages/login.php");
    exit;
  }
}

$SITE_TITLE = 'สรุปผลแบบทดสอบก่อนเรียน (Pre-test Overview)';

// ---------- Utilities ที่รองรับโฮสต์ไม่มี mysqlnd ----------
function stmt_fetch_all_assoc(mysqli_stmt $stmt): array {
  if (method_exists($stmt, 'get_result')) {
    $res = @$stmt->get_result();
    if ($res) return $res->fetch_all(MYSQLI_ASSOC);
  }
  $data = [];
  $stmt->store_result();
  $meta = $stmt->result_metadata();
  if (!$meta) return $data;
  $row = [];
  $bind = [];
  $fields = [];
  while ($f = $meta->fetch_field()) {
    $fields[] = $f->name;
    $row[$f->name] = null;
    $bind[] = &$row[$f->name];
  }
  call_user_func_array([$stmt, 'bind_result'], $bind);
  while ($stmt->fetch()) {
    $copy = [];
    foreach ($fields as $name) $copy[$name] = $row[$name];
    $data[] = $copy;
  }
  return $data;
}
function has_table(mysqli $conn, string $table): bool {
  $t = $conn->real_escape_string($table);
  $res = $conn->query("SHOW TABLES LIKE '{$t}'");
  return (bool)($res && $res->num_rows);
}
function has_column(mysqli $conn, string $table, string $col): bool {
  $t = $conn->real_escape_string($table);
  $c = $conn->real_escape_string($col);
  $res = $conn->query("SHOW COLUMNS FROM `{$t}` LIKE '{$c}'");
  return (bool)($res && $res->num_rows);
}
function findDashboardUrl(): string {
  if (!empty($_SESSION['dashboard_url'])) return (string)$_SESSION['dashboard_url'];
  foreach (['../dashboard.php','dashboard.php','../index.php','index.php'] as $p) {
    $abs = realpath(__DIR__ . '/' . $p);
    if ($abs && is_file($abs)) return $p;
  }
  return 'javascript:history.back()';
}

// ---------- โหลดตัวเลือกชั้น/ห้อง ----------
$classCol = has_table($conn,'users') && has_column($conn,'users','class_level') ? 'class_level' : null;
$classOptions = [];
if ($classCol) {
  $sql = "SELECT DISTINCT `$classCol` AS c FROM users WHERE role='student' AND `$classCol` IS NOT NULL AND `$classCol`<>'' ORDER BY c";
  if ($rs = $conn->query($sql)) while ($r = $rs->fetch_assoc()) $classOptions[] = $r['c'];
}
$selClass = isset($_GET['class']) ? trim((string)$_GET['class']) : '';

// ---------- ดึง attempt ล่าสุดของแต่ละนักเรียน (เฉพาะ pre) + กรองชั้น ----------
/*
   ขั้นตอน:
   1) เลือก user_id นักเรียน (option กรอง class_level)
   2) สำหรับ user เหล่านี้ หา attempt ล่าสุด (MAX(id)) ของ test_type='pre'
   3) ดึงรายละเอียด attempt เหล่านั้นทั้งหมด
*/
$studentIds = [];
if (has_table($conn,'users')) {
  $where = "WHERE role='student'";
  if ($classCol && $selClass !== '') {
    $esc = $conn->real_escape_string($selClass);
    $where .= " AND `$classCol`='{$esc}'";
  }
  $sqlStu = "SELECT id FROM users $where";
  if ($rs = $conn->query($sqlStu)) while ($r = $rs->fetch_assoc()) $studentIds[] = (int)$r['id'];
}
$totalStudentsEligible = count($studentIds);

// ถ้าไม่มี users table ให้ถือว่าขอบเขตคือทุก attempt pre ทั้งหมด
$limitScopeByUsers = $totalStudentsEligible > 0;

$latestAttemptIds = []; // attempt_id ล่าสุดต่อคน (pre)
$attemptRows = [];      // แถว attempt สำหรับคนที่มีล่าสุด (ไว้ใช้คำนวณสถิติ)

if ($limitScopeByUsers) {
  // แบ่งกลุ่มเป็นก้อน ๆ เผื่อ IN (...) ยาว
  $chunkSize = 500;
  foreach (array_chunk($studentIds, $chunkSize) as $chunk) {
    $place = implode(',', array_fill(0, count($chunk), '?'));
    $types = str_repeat('i', count($chunk));
    $sql = "SELECT user_id, MAX(id) AS max_id
            FROM test_attempts
            WHERE test_type='pre' AND user_id IN ($place)
            GROUP BY user_id";
    $stmt = $conn->prepare($sql);
    // bind ด้วย array-ref helper
    $params = []; $params[] = &$types;
    foreach ($chunk as $i => $v) { $params[] = &$chunk[$i]; }
    call_user_func_array([$stmt, 'bind_param'], $params);
    $stmt->execute();
    $rows = stmt_fetch_all_assoc($stmt);
    foreach ($rows as $r) $latestAttemptIds[] = (int)$r['max_id'];
  }
} else {
  // ไม่มีตาราง users -> เอาทุก user ที่มี pre
  $sql = "SELECT user_id, MAX(id) AS max_id FROM test_attempts WHERE test_type='pre' GROUP BY user_id";
  if ($stmt = $conn->prepare($sql)) {
    $stmt->execute();
    $rows = stmt_fetch_all_assoc($stmt);
    foreach ($rows as $r) $latestAttemptIds[] = (int)$r['max_id'];
  }
}

$latestAttemptIds = array_values(array_unique(array_filter($latestAttemptIds)));
$studentsWithPre = count($latestAttemptIds);

// โหลดรายละเอียด attempt เหล่านี้
if ($latestAttemptIds) {
  foreach (array_chunk($latestAttemptIds, 500) as $chunk) {
    $place = implode(',', array_fill(0, count($chunk), '?'));
    $types = str_repeat('i', count($chunk));
    $sql = "SELECT id, user_id, score, max_score, duration_seconds, started_at, submitted_at
            FROM test_attempts WHERE id IN ($place)";
    $stmt = $conn->prepare($sql);
    $params = []; $params[] = &$types;
    foreach ($chunk as $i => $v) { $params[] = &$chunk[$i]; }
    call_user_func_array([$stmt, 'bind_param'], $params);
    $stmt->execute();
    $rows = stmt_fetch_all_assoc($stmt);
    foreach ($rows as $r) {
      $attemptRows[(int)$r['id']] = [
        'user_id' => (int)$r['user_id'],
        'score'   => (int)$r['score'],
        'max'     => max(1, (int)$r['max_score']),
        'secs'    => max(0, (int)$r['duration_seconds']),
        'started' => (string)$r['started_at'],
        'ended'   => (string)$r['submitted_at'],
      ];
    }
  }
}

// ---------- สถิติคะแนนรวม/ฮิสโตแกรม ----------
$percents = []; $durations = [];
foreach ($attemptRows as $att) {
  $pct = round($att['score'] * 100.0 / $att['max'], 2);
  $percents[] = $pct;
  $durations[] = $att['secs'];
}
sort($percents);
$overallAvgPct = $percents ? round(array_sum($percents)/count($percents), 2) : null;
// ควอร์ตайлเล็ก ๆ
function percentile(array $arr, float $p): ?float {
  if (!$arr) return null;
  $n = count($arr);
  $idx = ($n - 1) * $p;
  $lo = (int)floor($idx); $hi = (int)ceil($idx);
  if ($lo === $hi) return (float)$arr[$lo];
  return (float)($arr[$lo] + ($idx - $lo) * ($arr[$hi] - $arr[$lo]));
}
$p50 = percentile($percents, 0.5);
$avgSecs = $durations ? round(array_sum($durations)/count($durations), 2) : null;

// ฮิสโตแกรมช่วง 10 แต้ม: 0–9, 10–19, …, 100
$bins = array_fill(0, 11, 0);
foreach ($percents as $p) {
  $b = (int)floor($p / 10.0);
  if ($b < 0) $b = 0; if ($b > 10) $b = 10;
  $bins[$b]++;
}
$binLabels = ['0–9','10–19','20–29','30–39','40–49','50–59','60–69','70–79','80–89','90–99','100'];

// ---------- วิเคราะห์รายข้อ: อัตราตอบถูก (% correct) ต่อ question ----------
$questionStats = []; // qid => ['correct'=>x,'total'=>y]
if ($latestAttemptIds) {
  foreach (array_chunk($latestAttemptIds, 500) as $chunk) {
    $place = implode(',', array_fill(0, count($chunk), '?'));
    $types = str_repeat('i', count($chunk));
    $sql = "SELECT question_id, SUM(is_correct) AS c, COUNT(*) AS n
            FROM test_answers
            WHERE attempt_id IN ($place)
            GROUP BY question_id";
    $stmt = $conn->prepare($sql);
    $params = []; $params[] = &$types;
    foreach ($chunk as $i => $v) { $params[] = &$chunk[$i]; }
    call_user_func_array([$stmt, 'bind_param'], $params);
    $stmt->execute();
    $rows = stmt_fetch_all_assoc($stmt);
    foreach ($rows as $r) {
      $qid = (int)$r['question_id'];
      $c = (int)$r['c']; $n = max(1, (int)$r['n']);
      if (!isset($questionStats[$qid])) $questionStats[$qid] = ['correct'=>0,'total'=>0];
      $questionStats[$qid]['correct'] += $c;
      $questionStats[$qid]['total']   += $n;
    }
  }
}
// เติมข้อความคำถาม/หน่วย
$hardest = []; // จะจัดเรียงภายหลัง
if ($questionStats) {
  $qids = array_keys($questionStats);
  foreach (array_chunk($qids, 500) as $chunk) {
    $place = implode(',', array_fill(0, count($chunk), '?'));
    $types = str_repeat('i', count($chunk));
    $sql = "SELECT id, `text`, COALESCE(`unit`,'') AS unit FROM questions WHERE id IN ($place)";
    $stmt = $conn->prepare($sql);
    $params = []; $params[] = &$types;
    foreach ($chunk as $i => $v) { $params[] = &$chunk[$i]; }
    call_user_func_array([$stmt, 'bind_param'], $params);
    $stmt->execute();
    $rows = stmt_fetch_all_assoc($stmt);
    foreach ($rows as $r) {
      $qid = (int)$r['id'];
      if (!isset($questionStats[$qid])) continue;
      $q = $questionStats[$qid];
      $pct = round($q['correct'] * 100.0 / max(1, $q['total']), 1);
      $hardest[$qid] = [
        'qid'  => $qid,
        'text' => (string)$r['text'],
        'unit' => (string)$r['unit'],
        'pct'  => $pct,
        'n'    => (int)$q['total'],
      ];
    }
  }
  // เรียงจากยากสุด (เปอร์เซ็นต์ถูกต่ำ -> สูง)
  usort($hardest, function($a,$b){
    if ($a['pct'] === $b['pct']) return $a['qid'] <=> $b['qid'];
    return $a['pct'] < $b['pct'] ? -1 : 1;
  });
  // ตัด Top 10 ที่ยากสุด
  $hardest = array_slice($hardest, 0, 10);
}

// ---------- สรุปตามหน่วย (unit) ----------
$unitAgg = []; // unit => [sumPct, n]
if ($questionStats) {
  // map question_id -> unit
  $qidToUnit = [];
  // ใช้ข้อมูลที่ดึงไว้แล้วใน $hardest + ดึงเพิ่มถ้าขาด
  foreach ($hardest as $h) $qidToUnit[$h['qid']] = $h['unit'];
  $missing = array_diff(array_keys($questionStats), array_keys($qidToUnit));
  if ($missing) {
    foreach (array_chunk($missing, 500) as $chunk) {
      $place = implode(',', array_fill(0, count($chunk), '?'));
      $types = str_repeat('i', count($chunk));
      $sql = "SELECT id, COALESCE(`unit`,'') AS unit FROM questions WHERE id IN ($place)";
      $stmt = $conn->prepare($sql);
      $params = []; $params[] = &$types;
      foreach ($chunk as $i => $v) { $params[] = &$chunk[$i]; }
      call_user_func_array([$stmt, 'bind_param'], $params);
      $stmt->execute();
      $rows = stmt_fetch_all_assoc($stmt);
      foreach ($rows as $r) $qidToUnit[(int)$r['id']] = (string)$r['unit'];
    }
  }
  foreach ($questionStats as $qid => $q) {
    $unit = $qidToUnit[$qid] ?? '';
    $pct = $q['correct'] * 100.0 / max(1, $q['total']);
    if (!isset($unitAgg[$unit])) $unitAgg[$unit] = ['sum'=>0,'n'=>0];
    $unitAgg[$unit]['sum'] += $pct;
    $unitAgg[$unit]['n']   += 1;
  }
}
ksort($unitAgg);

// ---------- เตรียมข้อมูลสำหรับกราฟ/ตาราง ----------
$dashboardUrl = findDashboardUrl();
$histLabels = $binLabels;
$histData   = $bins;

$unitLabels = []; $unitPcts = [];
foreach ($unitAgg as $u => $ag) {
  $unitLabels[] = $u === '' ? 'ไม่ระบุหน่วย' : $u;
  $unitPcts[]   = round($ag['sum'] / max(1,$ag['n']), 1);
}

?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($SITE_TITLE) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body class="bg-light">

<nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
  <div class="container">
    <span class="navbar-brand fw-bold"><?= htmlspecialchars($SITE_TITLE) ?></span>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a href="<?= htmlspecialchars($dashboardUrl) ?>" class="btn btn-outline-secondary btn-sm rounded-pill">← แดชบอร์ด</a>
    </div>
  </div>
</nav>

<div class="container my-4">
  <div class="d-flex flex-wrap align-items-center justify-content-between mb-3">
    <div>
      <h4 class="mb-0">ภาพรวมผลก่อนเรียน (Pre-test)</h4>
      <div class="text-muted small">ใช้ attempt ล่าสุดของนักเรียนแต่ละคน</div>
    </div>
    <?php if (!empty($classOptions)): ?>
      <form method="get" class="d-flex align-items-center gap-2">
        <label class="small text-muted">ชั้น/ห้อง:</label>
        <select name="class" class="form-select form-select-sm" onchange="this.form.submit()">
          <option value="">— ทั้งหมด —</option>
          <?php foreach ($classOptions as $c): ?>
            <option value="<?= htmlspecialchars($c) ?>" <?= $selClass===$c?'selected':'' ?>><?= htmlspecialchars($c) ?></option>
          <?php endforeach; ?>
        </select>
      </form>
    <?php endif; ?>
  </div>

  <?php if (empty($latestAttemptIds)): ?>
    <div class="alert alert-secondary">ยังไม่พบข้อมูลแบบทดสอบก่อนเรียนในขอบเขตที่เลือก</div>
  <?php else: ?>

    <!-- Metrics -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">นักเรียนที่ทำก่อนเรียน</div>
            <div class="fs-4 fw-bold"><?= (int)$studentsWithPre ?></div>
            <div class="small text-muted">จาก <?= $limitScopeByUsers ? (int)$totalStudentsEligible : (int)$studentsWithPre ?> คน</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">คะแนนเฉลี่ยรวม (%)</div>
            <div class="fs-4 fw-bold"><?= is_null($overallAvgPct)?'–':$overallAvgPct ?></div>
            <div class="small text-muted">มัธยฐาน: <?= is_null($p50)?'–':round($p50,1) ?>%</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">เวลาเฉลี่ย (วินาที)</div>
            <div class="fs-4 fw-bold"><?= is_null($avgSecs)?'–':$avgSecs ?></div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Coverage (%)</div>
            <div class="fs-4 fw-bold">
              <?php
                if ($limitScopeByUsers && $totalStudentsEligible>0) {
                  echo round(($studentsWithPre / $totalStudentsEligible)*100, 1);
                } else {
                  echo '100.0';
                }
              ?>
            </div>
            <div class="small text-muted">นักเรียนที่มีข้อมูล / ทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row g-3 mb-3">
      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header fw-semibold">การกระจายคะแนน (ร้อยละ)</div>
          <div class="card-body">
            <canvas id="chartHist" height="140"></canvas>
            <div class="small text-muted mt-2">ช่วง 0–9, 10–19, …, 100</div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header fw-semibold">คะแนนเฉลี่ยตามหน่วย (unit)</div>
          <div class="card-body">
            <?php if ($unitLabels): ?>
              <canvas id="chartUnit" height="140"></canvas>
            <?php else: ?>
              <div class="text-muted">ยังไม่มีการแมปหน่วย (unit) ในตารางคำถาม</div>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>

    <!-- Hardest questions -->
    <div class="card shadow-sm mb-3">
      <div class="card-header fw-semibold">คำถามที่ยากที่สุด (อัตราตอบถูกต่ำสุด)</div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width:70px;">QID</th>
                <th>คำถาม</th>
                <th>หน่วย</th>
                <th class="text-end" style="width:140px;">ถูก (%)</th>
                <th class="text-end" style="width:120px;">จำนวนคำตอบ</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($hardest as $h): ?>
                <tr>
                  <td><?= (int)$h['qid'] ?></td>
                  <td><?= htmlspecialchars(mb_strimwidth($h['text'], 0, 140, '…','UTF-8')) ?></td>
                  <td><?= htmlspecialchars($h['unit'] ?: '—') ?></td>
                  <td class="text-end"><?= number_format($h['pct'],1) ?></td>
                  <td class="text-end"><?= (int)$h['n'] ?></td>
                </tr>
              <?php endforeach; if (!$hardest): ?>
                <tr><td colspan="5" class="text-center text-muted py-3">ยังไม่มีข้อมูลเพียงพอ</td></tr>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- รายการ attempt ล่าสุด (ย่อ) -->
    <div class="card shadow-sm">
      <div class="card-header fw-semibold">รายการผลล่าสุดรายคน</div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width:90px;">User ID</th>
                <th class="text-end" style="width:140px;">คะแนน (ร้อยละ)</th>
                <th class="text-end" style="width:120px;">เวลา (วิ)</th>
                <th>เริ่ม</th>
                <th>ส่ง</th>
              </tr>
            </thead>
            <tbody>
              <?php
              // แปลงเป็นแถวพร้อมเปอร์เซ็นต์
              $rowsMini = [];
              foreach ($attemptRows as $aid => $a) {
                $rowsMini[] = [
                  'user_id'=>$a['user_id'],
                  'pct'=>round($a['score']*100.0/$a['max'],1),
                  'secs'=>$a['secs'],
                  'start'=>$a['started'],
                  'end'=>$a['ended'],
                ];
              }
              // เรียงจากมาก -> น้อย
              usort($rowsMini, fn($x,$y)=> $y['pct']<=>$x['pct']);
              foreach ($rowsMini as $r):
              ?>
                <tr>
                  <td><?= (int)$r['user_id'] ?></td>
                  <td class="text-end"><?= number_format($r['pct'],1) ?></td>
                  <td class="text-end"><?= (int)$r['secs'] ?></td>
                  <td><?= htmlspecialchars($r['start']) ?></td>
                  <td><?= htmlspecialchars($r['end']) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  <?php endif; ?>
</div>

<footer class="py-4 mt-5 bg-white border-top">
  <div class="container small text-muted">© <?= date('Y') ?> • Pre-test Class Overview</div>
</footer>

<script>
(function(){
  const histLabels = <?= json_encode($histLabels, JSON_UNESCAPED_UNICODE) ?>;
  const histData   = <?= json_encode($histData) ?>;
  const unitLabels = <?= json_encode($unitLabels, JSON_UNESCAPED_UNICODE) ?>;
  const unitPcts   = <?= json_encode($unitPcts) ?>;

  function ctx(id){ const el=document.getElementById(id); return el?el.getContext('2d'):null; }

  const ch1 = ctx('chartHist');
  if (ch1) new Chart(ch1, {
    type:'bar',
    data:{ labels: histLabels, datasets:[{ label:'จำนวนคน', data: histData }] },
    options:{
      responsive:true,
      scales:{ y:{ beginAtZero:true, ticks:{ precision:0 } } },
      plugins:{ legend:{ display:false } }
    }
  });

  const ch2 = ctx('chartUnit');
  if (ch2 && unitLabels && unitLabels.length) new Chart(ch2, {
    type:'bar',
    data:{ labels: unitLabels, datasets:[{ label:'เปอร์เซ็นต์ถูกเฉลี่ย', data: unitPcts }] },
    options:{
      responsive:true,
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } },
      plugins:{ legend:{ display:false } }
    }
  });
})();
</script>
</body>
</html>
