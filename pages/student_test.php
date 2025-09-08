<?php
/* ======================================================================
   pages/student_test.php — แบบทดสอบก่อน/หลังเรียน (Bootstrap 5, PHP/MySQL)
   - คงเลย์เอาต์เดิมของหน้านี้ (ไม่ include game_header.php)
   - ใช้ requireStudent() เช่นเดียวกับหน้าเกม ป้องกันเด้งไปหน้า Login
   - ปุ่ม "แดชบอร์ด" ใช้ URL จาก session เหมือนระบบเกม (ถ้ามี) + fallback ตรวจไฟล์จริง
   - รองรับรูปภาพในคำถาม/ตัวเลือก (image_path) โดยตรวจ schema อัตโนมัติ
   - บันทึกผลลงตาราง test_attempts / test_answers
   ====================================================================== */

if (session_status() === PHP_SESSION_NONE) session_start();

require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent(); // จำกัดเฉพาะนักเรียนที่ล็อกอินแล้วเท่านั้น

// ไม่โชว์ error บนหน้า (ให้ไปที่ error log)
ini_set('display_errors', 0);
ini_set('log_errors', 1);

/* ---------------- Helpers ---------------- */
function csrf_token(): string {
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
  return $_SESSION['csrf'];
}
function csrf_validate($t): bool {
  return hash_equals($_SESSION['csrf'] ?? '', $t ?? '');
}
/** bind_param refs สำหรับ IN(?,?,...) */
function bind_params_refs(mysqli_stmt $stmt, string $types, array $values): void {
  $params = []; $params[] = &$types;
  foreach ($values as $i => $v) { $params[] = &$values[$i]; }
  call_user_func_array([$stmt, 'bind_param'], $params);
}
/** ตรวจว่าตารางมีคอลัมน์หรือไม่ */
function has_column(mysqli $conn, string $table, string $column): bool {
  $sql = "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1";
  $st = $conn->prepare($sql);
  $st->bind_param('ss', $table, $column);
  $st->execute();
  return (bool)$st->get_result()->fetch_row();
}
/** ตรวจว่ามีตารางหรือไม่ (ใช้ตอนพยายามอ่านชื่อผู้เรียนจาก DB) */
function has_table(mysqli $conn, string $table): bool {
  $sql = "SELECT 1 FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1";
  $st = $conn->prepare($sql);
  $st->bind_param('s', $table);
  $st->execute();
  return (bool)$st->get_result()->fetch_row();
}
/** ดึงชื่อผู้เรียนแบบยืดหยุ่น: เอาจาก SESSION ก่อน แล้วค่อยลอง DB ถ้ามี */
function resolve_student_name(mysqli $conn): string {
  foreach (['display_name','full_name','student_name','name','username'] as $k) {
    if (!empty($_SESSION[$k])) return (string)$_SESSION[$k];
  }
  $first = $_SESSION['first_name'] ?? $_SESSION['firstname'] ?? null;
  $last  = $_SESSION['last_name']  ?? $_SESSION['lastname']  ?? null;
  if ($first || $last) return trim(($first ?? '').' '.($last ?? ''));

  $uid = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
  if ($uid > 0) {
    if (has_table($conn, 'students')) {
      foreach ([
        "SELECT full_name AS n FROM students WHERE id=?",
        "SELECT CONCAT(first_name,' ',last_name) AS n FROM students WHERE id=?",
        "SELECT name AS n FROM students WHERE id=?",
      ] as $sql) {
        $st = $conn->prepare($sql); $st->bind_param('i',$uid); $st->execute();
        $n = $st->get_result()->fetch_assoc()['n'] ?? null; if (!empty($n)) return (string)$n;
      }
    }
    if (has_table($conn, 'users')) {
      foreach ([
        "SELECT full_name AS n FROM users WHERE id=?",
        "SELECT CONCAT(first_name,' ',last_name) AS n FROM users WHERE id=?",
        "SELECT name AS n FROM users WHERE id=?",
        "SELECT username AS n FROM users WHERE id=?",
      ] as $sql) {
        $st = $conn->prepare($sql); $st->bind_param('i',$uid); $st->execute();
        $n = $st->get_result()->fetch_assoc()['n'] ?? null; if (!empty($n)) return (string)$n;
      }
    }
  }
  return 'นักเรียน';
}
/** ตัวอักษรหน้าชื่อ (สำหรับ avatar วงกลม) */
function thai_initial(string $name): string {
  $ch = mb_substr(trim($name), 0, 1, 'UTF-8');
  return mb_strtoupper($ch, 'UTF-8');
}
/** หา URL แดชบอร์ด: ยึดค่าจาก session ตามระบบเกม, ถ้าไม่มีให้ fallback เฉพาะไฟล์ที่มีอยู่จริง */
function pick_dashboard_url(): string {
  // ใช้ค่าเดียวกับ header ของระบบเกมถ้าเคยตั้งไว้
  if (!empty($_SESSION['student_dashboard_url'])) return (string)$_SESSION['student_dashboard_url'];
  if (!empty($_SESSION['dashboard_url'])) return (string)$_SESSION['dashboard_url'];

  // ตรวจหาไฟล์จริงในโปรเจกต์ (relative จากโฟลเดอร์ /pages)
  $candidates = [
    '../student/dashboard.php',
    '../pages/student_dashboard.php',
    '../dashboard.php',
    '../home.php',
    'dashboard.php',
    'index.php', // ใช้เฉพาะกรณี index ของ "แดชบอร์ด" จริง ไม่ใช่หน้า login
  ];
  foreach ($candidates as $p) {
    $abs = realpath(__DIR__ . '/' . $p);
    if ($abs && is_file($abs)) return $p;
  }
  // ทางหนีไฟ: กลับหน้าก่อนหน้า (เลี่ยงการชี้ไป login)
  return 'javascript:history.back()';
}

/* ---------------- ค่าหน้า ---------------- */
$SITE_TITLE   = 'แบบฝึกทักษะวิทยาการคำนวณ ป.4';
$studentName  = resolve_student_name($conn);
$initial      = thai_initial($studentName);
$dashboardUrl = pick_dashboard_url();

$typeParam = strtolower(trim($_GET['type'] ?? 'pre'));
$testType  = ($typeParam === 'post') ? 'post' : 'pre';
$title     = ($testType === 'pre') ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน';
$QUESTION_COUNT = 30;

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

// ตรวจ schema ว่ามี image_path หรือไม่
$hasQImage = has_column($conn, 'questions', 'image_path');
$hasCImage = has_column($conn, 'choices',   'image_path');

/* ---------------- โฟลว์หลัก ---------------- */
$view = 'form';     // 'form' | 'result' | 'not_enough'
$questions = [];    // โครงสร้าง: [qid => ['text','qimg','choices'=>[['cid','text','cimg'], ...]]]
$attempt = null;    // ข้อมูลสรุปผลหลังส่ง

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // เริ่มเซสชันทดสอบใหม่
  unset($_SESSION['test_qids'], $_SESSION['test_started_at'], $_SESSION['test_type']);

  // สุ่ม ID คำถาม
  $stmt = $conn->prepare("SELECT id FROM questions WHERE active=1 ORDER BY RAND() LIMIT ?");
  $stmt->bind_param('i', $QUESTION_COUNT);
  $stmt->execute();
  $res  = $stmt->get_result();
  $qids = array_map('intval', array_column($res->fetch_all(MYSQLI_ASSOC), 'id'));

  if (count($qids) < $QUESTION_COUNT) {
    $view = 'not_enough';
  } else {
    $_SESSION['test_qids']       = $qids;
    $_SESSION['test_started_at'] = time();
    $_SESSION['test_type']       = $testType;

    $inQ   = implode(',', array_fill(0, count($qids), '?'));
    $types = str_repeat('i', count($qids));

    // ใส่ backtick รอบคอลัมน์ `text`
    if ($hasQImage && $hasCImage) {
      $sql = "SELECT q.id AS qid, q.`text` AS qtext, q.image_path AS qimg,
                     c.id AS cid, c.`text` AS ctext, c.image_path AS cimg
              FROM questions q
              JOIN choices   c ON c.question_id = q.id
              WHERE q.id IN ($inQ)
              ORDER BY q.id, RAND()";
    } else {
      $sql = "SELECT q.id AS qid, q.`text` AS qtext, NULL AS qimg,
                     c.id AS cid, c.`text` AS ctext, NULL AS cimg
              FROM questions q
              JOIN choices   c ON c.question_id = q.id
              WHERE q.id IN ($inQ)
              ORDER BY q.id, RAND()";
    }
    $stmt = $conn->prepare($sql);
    bind_params_refs($stmt, $types, $qids);
    $stmt->execute();
    $res = $stmt->get_result();

    while ($row = $res->fetch_assoc()) {
      $qid = (int)$row['qid'];
      if (!isset($questions[$qid])) {
        $questions[$qid] = [
          'text'    => (string)$row['qtext'],
          'qimg'    => $row['qimg'] ?? null,
          'choices' => []
        ];
      }
      $questions[$qid]['choices'][] = [
        'cid'  => (int)$row['cid'],
        'text' => (string)$row['ctext'],
        'cimg' => $row['cimg'] ?? null
      ];
    }
  }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!csrf_validate($_POST['csrf'] ?? '')) {
    http_response_code(403);
    exit('CSRF ไม่ถูกต้อง');
  }
  $qids    = $_SESSION['test_qids']       ?? [];
  $started = (int)($_SESSION['test_started_at'] ?? 0);
  $ttype   = $_SESSION['test_type']       ?? $testType;

  if (!$qids || !$started) {
    header('Location: '.$_SERVER['PHP_SELF'].'?type='.$testType);
    exit;
  }

  $answers  = $_POST['q'] ?? [];    // q[question_id] = choice_id
  $maxScore = count($qids);

  $inQ   = implode(',', array_fill(0, count($qids), '?'));
  $types = str_repeat('i', count($qids));
  $sql = "SELECT c.question_id, c.id AS choice_id, c.is_correct
          FROM choices c
          WHERE c.question_id IN ($inQ)";
  $stmt = $conn->prepare($sql);
  bind_params_refs($stmt, $types, $qids);
  $stmt->execute();
  $res = $stmt->get_result();
  $correct = [];
  while ($row = $res->fetch_assoc()) {
    $correct[(int)$row['question_id']][(int)$row['choice_id']] = (int)$row['is_correct'];
  }

  $score = 0; $detail = [];
  foreach ($qids as $qid) {
    $cid = isset($answers[$qid]) ? (int)$answers[$qid] : 0;
    $ok  = ($cid && !empty($correct[$qid][$cid])) ? 1 : 0;
    if ($ok) $score++;
    $detail[] = ['qid'=>$qid,'cid'=>$cid,'ok'=>$ok];
  }

  // บันทึกผลสรุป + คำตอบรายข้อ
  $now      = time();
  $duration = max(1, $now - $started);

  $stmt = $conn->prepare("INSERT INTO test_attempts
    (user_id, test_type, score, max_score, started_at, submitted_at, duration_seconds)
    VALUES(?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?)");
  $stmt->bind_param('isiiiii', $userId, $ttype, $score, $maxScore, $started, $now, $duration);
  $stmt->execute();
  $attemptId = $stmt->insert_id;

  $stmt = $conn->prepare("INSERT INTO test_answers (attempt_id, question_id, choice_id, is_correct)
                          VALUES(?, ?, ?, ?)");
  foreach ($detail as $d) {
    $stmt->bind_param('iiii', $attemptId, $d['qid'], $d['cid'], $d['ok']);
    $stmt->execute();
  }

  $attempt = [
    'id'               => $attemptId,
    'user_id'          => $userId,
    'test_type'        => $ttype,
    'score'            => $score,
    'max_score'        => $maxScore,
    'duration_seconds' => $duration,
    'started_at'       => date('Y-m-d H:i:s', $started),
    'submitted_at'     => date('Y-m-d H:i:s', $now),
  ];
  unset($_SESSION['test_qids'], $_SESSION['test_started_at'], $_SESSION['test_type']);
  $view = 'result';
}
?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars(($view==='result') ? 'สรุปผลแบบทดสอบ' : $title) ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <style>
    :root{
      --brand1:#6f9cff; --brand2:#ffd166; --brand3:#06d6a0; --brand4:#f78c6b; --brand5:#cdb4db;
      --card-radius: 18px;
    }
    body{
      background: linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #fff9f3 100%);
      font-family: 'Kanit', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans Thai', sans-serif;
    }
    .navbar{ background: linear-gradient(90deg, #ffffff 0%, #f8fbff 100%) !important; }
    .brand-title{ font-weight: 700; color:#1f3f68; }
    .user-pill{
      background:#eef5ff; color:#1f3f68; border-radius:999px; padding:.25rem .75rem;
      font-weight:600; display:inline-flex; align-items:center; gap:.5rem;
    }
    .user-avatar{
      width:26px; height:26px; border-radius:50%;
      background:#6f9cff; color:#fff; display:inline-flex; align-items:center; justify-content:center;
      font-size:.9rem; font-weight:700;
    }
    .question-card{
      border: none; border-radius: var(--card-radius);
      box-shadow: 0 6px 18px rgba(31,63,104,.08); overflow: hidden; position: relative;
    }
    .question-card::before{ content:""; position:absolute; inset:0 auto 0 0; width:10px; background: var(--accent, var(--brand1)); }
    .question-card:nth-of-type(5n+1){ --accent: var(--brand1); }
    .question-card:nth-of-type(5n+2){ --accent: var(--brand2); }
    .question-card:nth-of-type(5n+3){ --accent: var(--brand3); }
    .question-card:nth-of-type(5n+4){ --accent: var(--brand4); }
    .question-card:nth-of-type(5n+5){ --accent: var(--brand5); }
    .card-title{ font-weight: 700; color:#1f3f68; }
    .choice-item{
      border: 2px solid rgba(31,63,104,.08) !important; border-radius: 12px; background: #fff;
      transition: box-shadow .15s, border-color .15s, background-color .15s; cursor:pointer;
    }
    .choice-item:hover{ box-shadow: 0 6px 16px rgba(31,63,104,.08); background: #f9fbff; }
    .choice-item.selected{ border-color: var(--accent, var(--brand1)) !important; background: #f7fbff; }
    .form-check-input{ transform: scale(1.25); margin-top:.5rem; }
    .question-image, .choice-image{ max-width:100%; height:auto; border-radius: 10px; }
    .sticky-submit{ position:sticky; bottom:0; z-index:1030; background:#fff; }
    .sticky-submit .btn{ padding:.7rem 1.1rem; font-weight:600; border-radius: 12px; }
    .progress{ background:#eaf2ff; border-radius: 999px; box-shadow: inset 0 1px 2px rgba(0,0,0,.05); }
    .progress-bar{ background: linear-gradient(90deg, var(--brand3), var(--brand1)); }
    .meta-pill{
      background:#eef5ff; color:#1f3f68; border-radius: 999px; padding:.25rem .75rem; font-weight:600;
    }
    footer.site-footer{ border-top: 1px solid rgba(0,0,0,.06); background:#fff; }
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
<?php if ($view === 'not_enough'): ?>
  <div class="alert alert-warning">
    <h5 class="alert-heading mb-2">ข้อสอบในคลังไม่เพียงพอ</h5>
    <p class="mb-0">ต้องมีอย่างน้อย <?= (int)$QUESTION_COUNT ?> ข้อใน <code>questions</code> (active=1) จึงจะเริ่มทำแบบทดสอบได้</p>
  </div>

<?php elseif ($view === 'result' && $attempt): 
  $percent = $attempt['max_score'] ? round($attempt['score']*100/$attempt['max_score'], 2) : 0.0;
  $badge   = ($percent >= 80) ? 'bg-success' : (($percent >= 50) ? 'bg-warning text-dark' : 'bg-danger');
  $label   = ($attempt['test_type']==='pre') ? 'ก่อนเรียน' : 'หลังเรียน';
?>
  <div class="row g-3">
    <div class="col-lg-8">
      <div class="card shadow-sm question-card">
        <div class="card-body">
          <h3 class="card-title">สรุปผลแบบทดสอบ (<?= htmlspecialchars($label) ?>)</h3>
          <p class="mb-1">คะแนน: <span class="badge <?= $badge ?>"><?= (int)$attempt['score'].' / '.(int)$attempt['max_score'] ?> (<?= $percent ?>%)</span></p>
          <p class="mb-1">เวลา: <?= (int)$attempt['duration_seconds'] ?> วินาที</p>
          <p class="text-muted mb-3">เริ่ม: <?= htmlspecialchars($attempt['started_at']) ?> | ส่ง: <?= htmlspecialchars($attempt['submitted_at']) ?></p>

          <div class="progress my-3" style="height:14px;">
            <div class="progress-bar <?= $badge ?>" role="progressbar" style="width: <?= $percent ?>%;" aria-valuenow="<?= $percent ?>" aria-valuemin="0" aria-valuemax="100"></div>
          </div>

          <div class="d-flex gap-2">
            <a class="btn btn-outline-secondary" href="<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?type=pre">เริ่มก่อนเรียนอีกครั้ง</a>
            <a class="btn btn-primary" href="<?= htmlspecialchars($_SERVER['PHP_SELF']) ?>?type=post">ทำหลังเรียน</a>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="alert alert-info">
        <strong>คำแนะนำ:</strong> เก็บภาพหน้าจอนี้แนบภาคผนวก และดึงสถิติภาพรวมจาก <code>test_attempts</code> ใช้วิเคราะห์บทที่ 4
      </div>
    </div>
  </div>

<?php else: ?>
  <!-- แบบทดสอบ -->
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="mb-0"><?= htmlspecialchars($title) ?></h3>
    <span class="meta-pill">รวมข้อ: <span id="totalQ"><?= count($questions) ?></span></span>
  </div>

  <div class="progress mb-3" style="height: 10px;">
    <div id="progressBar" class="progress-bar" role="progressbar" style="width:0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="<?= count($questions) ?>"></div>
  </div>
  <p class="small text-muted mb-3">ตอบแล้ว: <strong id="answeredCount">0</strong> / <span id="totalQ2"><?= count($questions) ?></span></p>

  <form id="examForm" method="post" novalidate>
    <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token()) ?>">

    <?php
    $no = 1;
    foreach ($questions as $qid => $q):
      $anchor = 'q-card-'.$qid;
    ?>
      <div class="card mb-3 shadow-sm question-card" id="<?= $anchor ?>">
        <div class="card-body">
          <h5 class="card-title mb-2"><?= $no.'. '.htmlspecialchars($q['text']) ?></h5>
          <?php if (!empty($q['qimg'])): ?>
            <div class="mb-2"><img class="question-image img-fluid" src="<?= htmlspecialchars($q['qimg']) ?>" alt="ภาพประกอบคำถาม"></div>
          <?php endif; ?>

          <?php foreach ($q['choices'] as $ch):
            $name = 'q['.$qid.']';
            $id   = 'q'.$qid.'_c'.$ch['cid'];
            $text = trim((string)$ch['text']);
            $img  = $ch['cimg'] ?? null;
          ?>
            <div class="form-check border p-2 mb-2 choice-item">
              <input class="form-check-input" type="radio" name="<?= $name ?>" id="<?= $id ?>" value="<?= (int)$ch['cid'] ?>" required>
              <label class="form-check-label w-100" for="<?= $id ?>">
                <?php if ($text !== ''): ?>
                  <div><?= htmlspecialchars($text) ?></div>
                <?php endif; ?>
                <?php if (!empty($img)): ?>
                  <div class="mt-1"><img class="choice-image img-fluid" src="<?= htmlspecialchars($img) ?>" alt="ภาพประกอบตัวเลือก"></div>
                <?php endif; ?>
              </label>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    <?php
      $no++;
    endforeach;
    ?>

    <div class="sticky-submit py-3 border-top">
      <div class="d-flex gap-2 justify-content-between align-items-center bg-white">
        <a href="#" class="btn btn-outline-secondary" id="scrollUnanswered">ไปข้อที่ยังไม่ได้ตอบ</a>
        <button class="btn btn-primary" type="submit">ส่งคำตอบ</button>
      </div>
    </div>
  </form>
<?php endif; ?>
</div>

<?php
// Footer นักเรียน (ใช้ของระบบเดิม ถ้ามี)
$FOOT = dirname(__DIR__) . '/includes/student_footer.php';
if (is_file($FOOT)) {
  include $FOOT;
} else {
  echo '<footer class="site-footer py-4 mt-5"><div class="container small text-muted">© '.date('Y').' • แบบฝึกทักษะวิทยาการคำนวณ ป.4 • ระบบทดสอบเพื่อการเรียนรู้</div></footer>';
}
?>

<script>
(function(){
  const total = (document.getElementById('totalQ')?.textContent || 0)*1;
  const answeredCount = document.getElementById('answeredCount');
  const progressBar   = document.getElementById('progressBar');

  function recalc(){
    if (!answeredCount || !progressBar) return;
    const groups = new Set();
    document.querySelectorAll('input[type=radio]:checked').forEach(el=>groups.add(el.name));
    const done = groups.size;
    answeredCount.textContent = done;
    const pct = total ? Math.round(done*100/total) : 0;
    progressBar.style.width = pct+'%';
    progressBar.setAttribute('aria-valuenow', done);
  }

  function markSelected(e){
    const r = e.target;
    if (r && r.type === 'radio'){
      const group = r.name;
      document.querySelectorAll(`input[name="${group}"]`).forEach(x=>{
        const item = x.closest('.choice-item');
        if (item) item.classList.remove('selected');
      });
      const picked = r.closest('.choice-item');
      if (picked) picked.classList.add('selected');
    }
  }

  document.querySelectorAll('input[type=radio]').forEach(r=>{
    r.addEventListener('change', recalc);
    r.addEventListener('change', markSelected);
    if (r.checked) r.dispatchEvent(new Event('change'));
  });
  recalc();

  const jump = document.getElementById('scrollUnanswered');
  if (jump) {
    jump.addEventListener('click', function(e){
      e.preventDefault();
      const cards = document.querySelectorAll('[id^=q-card-]');
      for (const card of cards) {
        const checked = Array.from(card.querySelectorAll('input[type=radio]')).some(r=>r.checked);
        if (!checked) {
          card.scrollIntoView({behavior:'smooth', block:'start'});
          card.classList.add('border','border-warning');
          setTimeout(()=>card.classList.remove('border','border-warning'), 1500);
          return;
        }
      }
    });
  }

  const form = document.getElementById('examForm');
  if (form) {
    form.addEventListener('submit', function(e){
      const cards = document.querySelectorAll('[id^=q-card-]');
      for (const card of cards) {
        const checked = Array.from(card.querySelectorAll('input[type=radio]')).some(r=>r.checked);
        if (!checked){
          e.preventDefault();
          card.scrollIntoView({behavior:'smooth', block:'start'});
          card.classList.add('border','border-danger');
          setTimeout(()=>card.classList.remove('border','border-danger'), 1500);
          alert('กรุณาตอบให้ครบทุกข้อก่อนส่งคำตอบ');
          return false;
        }
      }
    });
  }
})();
</script>
</body>
</html>
