<?php
/* ============================================================
   logic_debrief.php — สรุป/อภิปรายผลด่านตรรกะ 1–5 (GBL)
   ทางเลือก B: คำนวณจาก game_logs โดยตรง (ไม่สร้างตาราง/วิวเพิ่ม)
   ขึ้นกับ: ../includes/auth.php (requireStudent), ../includes/db.php ($conn)
   UI: Bootstrap 5 + Chart.js (CDN)
   ============================================================ */
if (session_status() === PHP_SESSION_NONE) session_start();

$BASE = __DIR__;
require_once $BASE . '/../includes/auth.php';
require_once $BASE . '/../includes/db.php';
requireStudent(); // บังคับต้องเป็นนักเรียนล็อกอิน

$SITE_TITLE  = 'แบบฝึกทักษะวิทยาการคำนวณ ป.4';
$studentName = $_SESSION['display_name'] ?? $_SESSION['full_name'] ?? $_SESSION['student_name'] ?? $_SESSION['username'] ?? 'นักเรียน';
$userId      = (int)($_SESSION['user_id'] ?? 0);
$fromStage   = $_GET['from'] ?? '';

// หาแดชบอร์ด (หน้าเด็ก)
$dashboardUrl = 'dashboard.php';
if (!is_file($BASE . '/dashboard.php')) {
  // เผื่อบางโปรเจกต์วางที่ root/pages หรือ index
  $dashboardUrl = 'index.php';
}

// ---------- ฟังก์ชันช่วย ----------
function normalize_action(string $a): string {
  $a = strtolower(trim($a));
  // จัดเข้ากลุ่มกว้าง ๆ เพื่อความยืดหยุ่น
  $mapSuccess = ['pass','success','complete','completed','win','correct','ok'];
  $mapFail    = ['fail','wrong','lose','incorrect','error','mistake'];
  $mapStart   = ['start','begin','enter','play','start_level','start_stage'];
  $mapSubmit  = ['submit','end','finish','done','timeout','quit','exit'];

  if (in_array($a, $mapSuccess, true)) return 'success';
  if (in_array($a, $mapFail, true))    return 'fail';
  if (in_array($a, $mapStart, true))   return 'start';
  if (in_array($a, $mapSubmit, true))  return 'submit';
  // ไม่รู้จัก: ปล่อยเป็น other ไว้
  return 'other';
}

function ts($x) {
  // รับค่า datetime หรือ string แล้วคืนเป็น timestamp (int); ถ้า null คืน null
  if ($x === null) return null;
  $t = is_int($x) ? $x : strtotime($x);
  return $t ?: null;
}

// ---------- ดึง logs ของผู้ใช้สำหรับ stage 1..5 ----------
$logs = [];
$hasTable = false;
if ($stmt = $conn->prepare("SHOW TABLES LIKE 'game_logs'")) {
  $stmt->execute();
  $hasTable = (bool)$stmt->get_result()->fetch_row();
  $stmt->close();
}

if ($hasTable) {
  // เลือกคอลัมน์ที่พอจะมีทั่วไป: id (ถ้ามี), stage_id, action, logged_at
  // หมายเหตุ: ถ้าไม่มี id ตารางก็ยังใช้งานได้ ด้วยการเรียงตาม logged_at
  $sql = "SELECT 
            /* safe columns */ 
            " . (function_exists('mysqli_get_server_info') ? "" : "") . "
            stage_id, action, logged_at
          " . (/* พยายามดึง id ถ้ามี */ " 
            " ) . " 
          FROM game_logs 
          WHERE user_id = ? AND stage_id BETWEEN 1 AND 5 
          ORDER BY stage_id ASC, logged_at ASC";
  // ลองตรวจว่ามีคอลัมน์ id ไหมเพื่อใช้เรียงเพิ่ม
  $res = $conn->query("SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='game_logs' AND COLUMN_NAME='id'");
  $hasIdCol = $res && $res->fetch_row();

  if ($hasIdCol) {
    $sql = "SELECT id, stage_id, action, logged_at 
            FROM game_logs 
            WHERE user_id = ? AND stage_id BETWEEN 1 AND 5 
            ORDER BY stage_id ASC, logged_at ASC, id ASC";
  }

  $stmt = $conn->prepare($sql);
  $stmt->bind_param('i', $userId);
  $stmt->execute();
  $rs = $stmt->get_result();
  while ($r = $rs->fetch_assoc()) {
    $logs[] = [
      'id'       => isset($r['id']) ? (int)$r['id'] : null,
      'stage_id' => (int)$r['stage_id'],
      'action'   => (string)$r['action'],
      'ts'       => ts($r['logged_at']),
      'raw_time' => $r['logged_at'],
    ];
  }
  $stmt->close();
}

// ---------- คำนวณความพยายาม (attempt) ต่อด่าน จากลอจิก start → (fail…หลายครั้ง) → terminal ----------
/*
  กติกา:
  - เมื่อพบ action = start → เปิด attempt ใหม่ (ถ้าอันก่อนยังไม่ปิด ให้ปิดเป็น abandon ด้วย score=0)
  - ระหว่าง attempt:
      * fail: เพิ่ม mistakes++
      * success: ปิด attempt (score=1)
      * submit: ปิด attempt (score=0) — ถ้าระบบของคุณต้องการให้ 'submit' นับเป็นผ่าน ให้ปรับด้านล่าง
  - other: ข้าม
  - หากพบ start ใหม่ขณะยังไม่ปิด attempt → ปิดอันเก่าเป็น abandon (score=0, end=เวลาของ start ใหม่)
*/
$attemptsByStage = [1=>[],2=>[],3=>[],4=>[],5=>[]];

if ($logs) {
  // แยกต่อด่าน
  $byStage = [1=>[],2=>[],3=>[],4=>[],5=>[]];
  foreach ($logs as $row) {
    if ($row['stage_id'] >=1 && $row['stage_id'] <=5) {
      $byStage[$row['stage_id']][] = $row;
    }
  }

  foreach ($byStage as $stage => $items) {
    $current = null; // ['start'=>ts, 'end'=>ts, 'mistakes'=>int, 'score'=>0/1]
    foreach ($items as $ev) {
      $kind = normalize_action($ev['action']);
      if ($kind === 'start') {
        if ($current && isset($current['start'])) {
          // ปิดอันเดิมแบบ abandon
          $current['end']   = $ev['ts'] ?? $current['start'];
          $current['score'] = 0;
          $attemptsByStage[$stage][] = $current;
        }
        $current = [
          'start'    => $ev['ts'] ?? time(),
          'end'      => null,
          'mistakes' => 0,
          'score'    => 0,
        ];
      } elseif ($kind === 'fail') {
        if ($current) $current['mistakes']++;
      } elseif ($kind === 'success') {
        if ($current) {
          $current['end']   = $ev['ts'] ?? ($current['start'] + 1);
          $current['score'] = 1;
          $attemptsByStage[$stage][] = $current;
          $current = null;
        }
      } elseif ($kind === 'submit') {
        if ($current) {
          $current['end']   = $ev['ts'] ?? ($current['start'] + 1);
          // ค่าเริ่มต้นถือว่า submit ไม่ได้บอกผ่าน/ตก → ให้ 0 (ปรับได้ถ้าระบบของคุณหมายถึงผ่าน)
          $current['score'] = 0;
          $attemptsByStage[$stage][] = $current;
          $current = null;
        }
      } else {
        // other → ไม่ทำอะไร
      }
    }
    // หากวนจบแล้วยังเปิดอยู่ ให้ปิดเป็น abandon ณ เวลา start+1 วินาที
    if ($current && isset($current['start']) && !$current['end']) {
      $current['end']   = $current['start'] + 1;
      $current['score'] = 0;
      $attemptsByStage[$stage][] = $current;
      $current = null;
    }
  }
}

// ---------- สรุปสถิติต่อด่าน ----------
$labels = ['ด่าน 1','ด่าน 2','ด่าน 3','ด่าน 4','ด่าน 5'];
$avgPct = $bestPct = $firstPct = $lastPct = $avgTime = $avgMistakes = $attempts = [null,null,null,null,null];

for ($i=1; $i<=5; $i++) {
  $list = $attemptsByStage[$i] ?? [];
  if (!$list) { continue; }

  $attempts[$i-1] = count($list);

  // คิดคะแนนเป็น 0/100
  $pcts = [];
  $times = [];
  $mist  = [];
  foreach ($list as $a) {
    $pcts[] = $a['score'] ? 100 : 0;
    $dur = max(0, (int)($a['end'] - $a['start']));
    $times[] = $dur;
    $mist[]  = (int)$a['mistakes'];
  }
  $avgPct[$i-1]  = round(array_sum($pcts)/count($pcts), 2);
  $bestPct[$i-1] = max($pcts);

  // first/last: ใช้ลำดับตามเวลาเกิดในลิสต์นี้
  $firstPct[$i-1] = (float)$pcts[0];
  $lastPct[$i-1]  = (float)$pcts[count($pcts)-1];

  $avgTime[$i-1]     = round(array_sum($times)/count($times), 2);
  $avgMistakes[$i-1] = round(array_sum($mist)/count($mist), 2);
}

$initial = mb_strtoupper(mb_substr($studentName,0,1,'UTF-8'),'UTF-8');
?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>สรุปและอภิปรายผลด่าน 1–5 (ตรรกะ)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    :root{
      --brand1:#6f9cff; /* ฟ้า */
      --brand2:#ffd166; /* เหลืองพาสเทล */
      --brand3:#06d6a0; /* เขียวมิ้นต์ */
      --brand4:#f78c6b; /* ส้มพีช */
      --brand5:#cdb4db; /* ม่วงพาสเทล */
      --ink:#1f3f68;
    }
    body{ background: linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #fff9f3 100%); }
    .navbar{ background: linear-gradient(90deg, #ffffff 0%, #f8fbff 100%) !important; }
    .brand-title{ font-weight:700; color:var(--ink); }
    .user-pill{ background:#eef5ff; color:var(--ink); border-radius:999px; padding:.25rem .75rem; font-weight:600; display:inline-flex; align-items:center; gap:.5rem; }
    .user-avatar{ width:26px; height:26px; border-radius:50%; background:#6f9cff; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:.9rem; font-weight:700; }

    .hero{
      background:#fff;
      border:1px solid rgba(0,0,0,.06);
      border-radius:18px;
      box-shadow: 0 8px 20px rgba(31,63,104,.08);
      padding:16px 18px;
    }
    .section-card{
      border:none; border-radius:18px;
      box-shadow: 0 8px 20px rgba(31,63,104,.08);
    }
    .section-card .card-header{
      background:#fff; border-bottom:1px solid rgba(0,0,0,.06);
      font-weight:700; color:var(--ink);
      border-top-left-radius:18px; border-top-right-radius:18px;
    }
    .metric{
      border-radius:14px; padding:14px; background:#f9fbff;
      border:1px solid rgba(0,0,0,.05);
    }
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
      เยี่ยมมาก! ผ่านด่านที่ 5 แล้ว—นี่คือสรุปผลการเล่นของคุณ เพื่อใช้พูดคุย/อภิปรายกับครูและเพื่อน
    </div>
  <?php endif; ?>

  <div class="hero mb-4">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div>
        <h4 class="mb-0">สรุปผลด่านตรรกะ (ด่าน 1–5)</h4>
        <div class="text-muted small">ดูแนวโน้มคะแนน เวลา และความผิดพลาด เพื่อนำไปสู่การอภิปราย</div>
      </div>
      <div>
        <span class="badge badge-soft me-1">ตรรกะ/ลำดับรูปแบบ</span>
        <span class="badge badge-soft">GBL</span>
      </div>
    </div>
  </div>

  <?php
    $hasAny = array_filter($attempts, fn($v)=> $v !== null);
    if (!$hasTable): ?>
      <div class="alert alert-warning">
        <strong>ไม่พบตาราง <code>game_logs</code> ในฐานข้อมูล</strong> โปรดตรวจสอบสคีมาฐานข้อมูลของคุณอีกครั้ง
      </div>
  <?php elseif (!$hasAny): ?>
      <div class="alert alert-secondary">
        ยังไม่พบข้อมูลความพยายามสำหรับผู้ใช้รายนี้ในด่าน 1–5 (อาจยังไม่เริ่มเล่น/ยังไม่บันทึก log)
        <div class="mt-2">
          <a href="<?= htmlspecialchars($dashboardUrl) ?>" class="btn btn-outline-secondary btn-sm">← กลับแดชบอร์ด</a>
        </div>
      </div>
  <?php else: ?>

    <!-- Metrics แถวบน -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">จำนวนความพยายามรวม</div>
          <div class="val">
            <?php
              $sumAttempts = array_sum(array_map(fn($v)=> (int)($v ?? 0), $attempts));
              echo (int)$sumAttempts;
            ?>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">ค่าเฉลี่ยคะแนน (%) ทั้ง 5 ด่าน</div>
          <div class="val">
            <?php
              $vals = array_filter($avgPct, fn($x)=> $x !== null);
              echo $vals ? round(array_sum($vals)/count($vals),2) : '–';
            ?>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">พัฒนาการล่าสุด (เฉลี่ย Last − First)</div>
          <div class="val">
            <?php
              $diffs=[]; for($i=0;$i<5;$i++){ if($firstPct[$i]!==null && $lastPct[$i]!==null){ $diffs[]=$lastPct[$i]-$firstPct[$i]; } }
              echo $diffs ? ((($d=round(array_sum($diffs)/count($diffs),2))>=0?'+':'').$d.'%') : '–';
            ?>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="metric h-100">
          <div class="text-muted small">บันทึกเวลา/ข้อผิดพลาด</div>
          <div class="val">
            <?= (array_filter($avgTime, fn($v)=>$v!==null) ? 'มีเวลา' : 'ไม่มีเวลา') ?>
            • <?= (array_filter($avgMistakes, fn($v)=>$v!==null) ? 'มีข้อผิดพลาด' : 'ไม่มีข้อผิดพลาด') ?>
          </div>
        </div>
      </div>
    </div>

    <!-- กราฟ 1: ค่าเฉลี่ยและคะแนนสูงสุดต่อด่าน -->
    <div class="card section-card mb-3">
      <div class="card-header">ภาพรวมคะแนนต่อด่าน</div>
      <div class="card-body">
        <canvas id="chartAvgBest" height="120"></canvas>
        <div class="small text-muted mt-2">กราฟแท่ง: ค่าเฉลี่ย (%) กับคะแนนดีที่สุด (%) ของผู้เรียนในแต่ละด่าน</div>
      </div>
    </div>

    <!-- กราฟ 2: เปรียบเทียบ First vs Last ต่อด่าน -->
    <div class="card section-card mb-3">
      <div class="card-header">พัฒนาการ: ครั้งแรก vs ล่าสุด</div>
      <div class="card-body">
        <canvas id="chartFirstLast" height="120"></canvas>
        <div class="small text-muted mt-2">ดูการเปลี่ยนแปลงของคะแนนจากความพยายามครั้งแรกไปสู่ครั้งล่าสุดในแต่ละด่าน</div>
      </div>
    </div>

    <!-- เวลาเฉลี่ย / ความผิดพลาดเฉลี่ย (ถ้ามีข้อมูล) -->
    <div class="row g-3">
      <?php if (array_filter($avgTime, fn($v)=>$v!==null)): ?>
      <div class="col-lg-6">
        <div class="card section-card">
          <div class="card-header">เวลาเฉลี่ยต่อด่าน (วินาที)</div>
          <div class="card-body">
            <canvas id="chartTime" height="120"></canvas>
          </div>
        </div>
      </div>
      <?php endif; ?>
      <?php if (array_filter($avgMistakes, fn($v)=>$v!==null)): ?>
      <div class="col-lg-6">
        <div class="card section-card">
          <div class="card-header">จำนวนความผิดพลาดเฉลี่ยต่อด่าน</div>
          <div class="card-body">
            <canvas id="chartMistake" height="120"></canvas>
          </div>
        </div>
      </div>
      <?php endif; ?>
    </div>

    <!-- กล่องแนวทางอภิปราย -->
    <div class="card section-card mt-3">
      <div class="card-header">แนวทางสรุป & อภิปรายชั้นเรียน (คุยกับนักเรียน)</div>
      <div class="card-body">
        <ul class="mb-2">
          <li><strong>ด่านไหนทำคะแนนได้ดีที่สุด?</strong> กฎ/หน่วยซ้ำ (pattern unit) ช่วยให้เร็วขึ้นอย่างไร</li>
          <li><strong>ด่านไหนใช้เวลานาน/ผิดพลาดมาก?</strong> คาดว่าเพราะหน่วยซ้ำยาวขึ้นหรือแบ่งตำแหน่งไม่ถูก</li>
          <li><strong>จาก First → Last</strong> นักเรียนปรับกลยุทธ์ยังไง (ขีดเส้นแบ่ง, เขียนเลขกำกับ, ทดลองกฎ ก่อนยึดกฎ)</li>
        </ul>
      </div>
    </div>

    <div class="mt-3">
      <a class="btn btn-outline-secondary" href="<?= htmlspecialchars($dashboardUrl) ?>">← กลับแดชบอร์ด</a>
    </div>

  <?php endif; ?>
</div>

<?php
// Footer ของระบบ (ถ้ามี)
$FOOT = $BASE . '/../includes/student_footer.php';
if (is_file($FOOT)) {
  include $FOOT;
} else {
  echo '<footer class="site-footer py-4 mt-5"><div class="container small text-muted">© '.date('Y').' • Game-Based Learning (Logic) • Summary & Debrief</div></footer>';
}
?>

<script>
(function(){
  // Data จาก PHP → JS
  const labels      = <?= json_encode($labels, JSON_UNESCAPED_UNICODE) ?>;
  const avgPct      = <?= json_encode($avgPct) ?>;
  const bestPct     = <?= json_encode($bestPct) ?>;
  const firstPct    = <?= json_encode($firstPct) ?>;
  const lastPct     = <?= json_encode($lastPct) ?>;
  const avgTime     = <?= json_encode($avgTime) ?>;
  const avgMistakes = <?= json_encode($avgMistakes) ?>;

  function mkCtx(id){ const el=document.getElementById(id); return el ? el.getContext('2d') : null; }

  // โทนสีเข้าธีม
  const C1='rgba(111,156,255,0.9)';  // brand1
  const C2='rgba(6,214,160,0.9)';    // brand3
  const C3='rgba(205,180,219,0.9)';  // brand5
  const C4='rgba(247,140,107,0.9)';  // brand4
  const C5='rgba(255,209,102,0.9)';  // brand2

  // Helper: กรอง null → 0 (เพื่อให้กราฟแสดงต่อเนื่อง) แต่รักษา null ถ้าอยากให้เว้นแท่ง
  const nz = a => a.map(v => v===null ? 0 : v);

  // กราฟ 1: Average vs Best
  const ctx1 = mkCtx('chartAvgBest');
  if (ctx1) new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'เฉลี่ย (%)', data: nz(avgPct), backgroundColor: C1 },
        { label: 'ดีที่สุด (%)', data: nz(bestPct), backgroundColor: C2 }
      ]
    },
    options: {
      responsive:true,
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } },
      plugins:{ legend:{ position:'top' }, tooltip:{ callbacks:{ label: c=> `${c.dataset.label}: ${c.parsed.y ?? 0}%` } } }
    }
  });

  // กราฟ 2: First vs Last
  const ctx2 = mkCtx('chartFirstLast');
  if (ctx2) new Chart(ctx2, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'ครั้งแรก (%)', data: nz(firstPct), backgroundColor: C3 },
        { label: 'ล่าสุด (%)', data: nz(lastPct), backgroundColor: C4 }
      ]
    },
    options: {
      responsive:true,
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } },
      plugins:{ legend:{ position:'top' } }
    }
  });

  // เวลาเฉลี่ย
  const ctx3 = mkCtx('chartTime');
  if (ctx3 && avgTime.some(v=>v !== null)) new Chart(ctx3, {
    type: 'bar',
    data: { labels, datasets: [{ label:'เวลาเฉลี่ย (วินาที)', data: nz(avgTime), backgroundColor: C5 }] },
    options: { responsive:true, scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ position:'top' } } }
  });

  // ความผิดพลาดเฉลี่ย
  const ctx4 = mkCtx('chartMistake');
  if (ctx4 && avgMistakes.some(v=>v !== null)) new Chart(ctx4, {
    type: 'bar',
    data: { labels, datasets: [{ label:'ความผิดพลาดเฉลี่ย (ครั้ง)', data: nz(avgMistakes), backgroundColor: C4 }] },
    options: { responsive:true, scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ position:'top' } } }
  });
})();
</script>
</body>
</html>
