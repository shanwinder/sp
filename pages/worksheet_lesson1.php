<?php
// File: pages/stage_logic_2.php
// ใบงานออนไลน์ ด่าน 2: ลำดับความคิด 4 ขั้น (งานเรียงลำดับ) — Bootstrap เท่านั้น

if (session_status()===PHP_SESSION_NONE) session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();

ini_set('display_errors', 0);
ini_set('log_errors', 1);

$conn->set_charset('utf8mb4');

$SITE_TITLE  = 'ใบงานออนไลน์ • ด่าน 2: ลำดับความคิด 4 ขั้น';
$userId      = (int)($_SESSION['user_id'] ?? 0);

/* ===== helpers (ย่อ) ===== */
function resolve_student_name(mysqli $conn): string {
  foreach (['display_name','full_name','student_name','name','username'] as $k) {
    if (!empty($_SESSION[$k])) return (string)$_SESSION[$k];
  }
  $first = $_SESSION['first_name'] ?? $_SESSION['firstname'] ?? null;
  $last  = $_SESSION['last_name']  ?? $_SESSION['lastname']  ?? null;
  if ($first || $last) return trim(($first ?? '').' '.($last ?? ''));
  return 'นักเรียน';
}
function thai_initial(string $name): string {
  $ch = mb_substr(trim($name), 0, 1, 'UTF-8');
  return mb_strtoupper($ch, 'UTF-8');
}
function pick_dashboard_url(): string {
  foreach (['../student/dashboard.php','../pages/student_dashboard.php','../dashboard.php','../home.php','dashboard.php','index.php'] as $p) {
    $abs = realpath(__DIR__ . '/' . $p);
    if ($abs && is_file($abs)) return $p;
  }
  return 'javascript:history.back()';
}
function csrf_token(): string {
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
  return $_SESSION['csrf'];
}
function csrf_validate($t): bool {
  return hash_equals($_SESSION['csrf'] ?? '', $t ?? '');
}

$studentName  = resolve_student_name($conn);
$initial      = thai_initial($studentName);
$dashboardUrl = pick_dashboard_url();

/* ===== ตารางเก็บใบงาน (ใช้สคีมาเดิม) =====
   หมายเหตุ: ขั้น 1 (สังเกต+จัดกลุ่ม) -> บันทึกลงทั้ง step_observe และ step_group
           ขั้น 2 (ข้อกำหนดก่อน–หลัง) -> บันทึกลง step_unit
           ขั้น 3 (ตั้งกฎลำดับ)       -> บันทึกลง step_rule
           ขั้น 4 (ทดสอบ+คาดการณ์)    -> บันทึกลง step_test และย่อเก็บใน step_predict */
$conn->query("
CREATE TABLE IF NOT EXISTS `worksheet_stage2` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `prompt_id` TINYINT NOT NULL DEFAULT 1,
  `step_observe` TEXT NOT NULL,
  `step_group` TEXT NOT NULL,
  `step_unit` VARCHAR(255) NOT NULL,
  `step_rule` TEXT NOT NULL,
  `step_test` TEXT NOT NULL,
  `step_predict` VARCHAR(255) NOT NULL,
  `confidence` TINYINT DEFAULT NULL,
  `auto_score` TINYINT NOT NULL DEFAULT 0,
  `teacher_score` TINYINT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
");

/* ===== POST: บันทึก (เหลือ 4 ช่อง) ===== */
$ok = null; $errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!csrf_validate($_POST['csrf'] ?? '')) { http_response_code(403); exit('CSRF ไม่ถูกต้อง'); }

  $step1 = trim($_POST['step1'] ?? ''); // สังเกต+จัดกลุ่ม
  $step2 = trim($_POST['step2'] ?? ''); // ข้อกำหนดก่อน–หลัง
  $step3 = trim($_POST['step3'] ?? ''); // ตั้งกฎลำดับ
  $step4 = trim($_POST['step4'] ?? ''); // ทดสอบ+คาดการณ์
  $conf  = (int)($_POST['confidence'] ?? 0);

  if (!$step1 || !$step2 || !$step3 || !$step4) $errors[] = 'กรอกให้ครบทั้ง 4 ขั้น';
  if (!$errors) {
    $filled = 0;
    foreach ([$step1,$step2,$step3,$step4] as $x) if (mb_strlen($x) >= 3) $filled++;
    $auto = min(4, $filled); // 0..4

    $prompt = 1;
    $predShort = mb_substr($step4, 0, 255, 'UTF-8'); // เก็บย่อในคอลัมน์ varchar

    $sql = "INSERT INTO worksheet_stage2
      (user_id, prompt_id, step_observe, step_group, step_unit, step_rule, step_test, step_predict, confidence, auto_score)
      VALUES(?,?,?,?,?,?,?,?,?,?)";
    if ($st = $conn->prepare($sql)) {
      // บันทึก step1 ซ้ำลง observe & group, step4 ซ้ำลง test และย่อเก็บใน predict
      $st->bind_param('iiisssssii', $userId,$prompt,$step1,$step1,$step2,$step3,$step4,$predShort,$conf,$auto);
      $ok = $st->execute();
      if (!$ok) $errors[] = 'บันทึกไม่สำเร็จ: '.$conn->error;
      $st->close();
    } else {
      $errors[] = 'ไม่สามารถเตรียมคำสั่งบันทึกได้';
    }
  }
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
</head>
<body>

<!-- เฮดเดอร์แบบเดิม -->
<nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
  <div class="container">
    <span class="navbar-brand fw-bold"><?= htmlspecialchars($SITE_TITLE) ?></span>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a class="btn btn-outline-secondary btn-sm" href="<?= htmlspecialchars($dashboardUrl) ?>">← แดชบอร์ด</a>
      <span class="badge text-bg-light"><span class="me-1"><?= htmlspecialchars($initial) ?></span><?= htmlspecialchars($studentName) ?></span>
    </div>
  </div>
</nav>

<div class="container my-4">

  <?php if ($ok && !$errors): ?>
    <div class="alert alert-success">บันทึกใบงานเรียบร้อยแล้ว!</div>
  <?php elseif ($errors): ?>
    <div class="alert alert-danger"><?php foreach ($errors as $e) echo '<div>'.htmlspecialchars($e).'</div>'; ?></div>
  <?php endif; ?>

  <!-- เคสเดียว: งานเรียงลำดับจริงของด่าน 2 -->
  <div class="card mb-3">
    <div class="card-header bg-white fw-semibold">เคสด่าน 2 (งานเรียงลำดับ)</div>
    <div class="card-body">
      <p class="mb-2">พิจารณาลำดับ “กิจวัตรตอนเช้า” ต่อไปนี้ แล้วอธิบาย <em>ลำดับความคิด 4 ขั้น</em> ของตนเองให้สั้น กระชับ และมีเหตุผล</p>
      <div class="border rounded p-3 bg-light">
        <strong>สถานการณ์:</strong><br>
        ตื่นนอน → ล้างหน้า → แปรงฟัน → แต่งตัว → กินข้าวเช้า → ไปโรงเรียน
      </div>
    </div>
  </div>

  <!-- ใบงาน: ลำดับความคิด 4 ขั้น -->
  <div class="card">
    <div class="card-header bg-white fw-semibold">ใบงาน • ลำดับความคิด 4 ขั้น (งานเรียงลำดับ)</div>
    <div class="card-body">
      <form method="post" class="needs-validation" novalidate>
        <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token()) ?>">

        <!-- 1) สังเกต + จัดกลุ่ม -->
        <div class="mb-3">
          <label class="form-label fw-semibold">1) สังเกตและจัดกลุ่ม</label>
          <textarea class="form-control" name="step1" rows="2" required
            placeholder="สิ่งที่เห็นชัด/ต้องมาก่อน-หลัง และจัดเป็นช่วง ๆ เช่น ‘เตรียมร่างกาย’ → ‘แต่งตัว’ → ‘รับประทานอาหาร’ → ‘เดินทาง’"></textarea>
          <div class="invalid-feedback">กรอกสิ่งที่สังเกตและการจัดกลุ่ม</div>
        </div>

        <!-- 2) ข้อกำหนดก่อน–หลัง -->
        <div class="mb-3">
          <label class="form-label fw-semibold">2) ข้อกำหนดก่อน–หลัง (Prerequisites)</label>
          <input type="text" class="form-control" name="step2" required
            placeholder="ระบุคู่สำคัญ 1–3 ข้อ เช่น ‘(ล้างหน้า และ/หรือ แปรงฟัน) ก่อน แต่งตัว’ / ‘แต่งตัว ก่อน ไปโรงเรียน’">
          <div class="invalid-feedback">กรอกข้อกำหนดก่อน–หลัง</div>
        </div>

        <!-- 3) ตั้งกฎลำดับ -->
        <div class="mb-3">
          <label class="form-label fw-semibold">3) ตั้งกฎลำดับ</label>
          <textarea class="form-control" name="step3" rows="2" required
            placeholder="นิยามกฎให้ชัด เช่น ‘ต้องผ่านกลุ่ม “เตรียมร่างกาย” ให้ครบก่อนเข้าสู่ “แต่งตัว” และต้องแต่งตัวก่อนรับประทานอาหาร’"></textarea>
          <div class="invalid-feedback">เขียนกฎลำดับให้ชัดเจน</div>
        </div>

        <!-- 4) ทดสอบ + คาดการณ์ -->
        <div class="mb-3">
          <label class="form-label fw-semibold">4) ทดสอบและคาดการณ์/แทรกเหตุการณ์ใหม่</label>
          <textarea class="form-control" name="step4" rows="2" required
            placeholder="ลองใช้กฎกับลำดับนี้ มีจุดไหนขัดแย้งไหม? และถ้ามีเหตุการณ์ใหม่ ‘ลืมสมุดการบ้าน’ ควรแทรกตรงไหน เพราะอะไร"></textarea>
          <div class="invalid-feedback">กรอกผลทดสอบและการคาดการณ์</div>
        </div>

        <div class="mb-3">
          <label class="form-label">ความมั่นใจของฉัน</label>
          <select class="form-select" name="confidence">
            <option value="5">5 – มั่นใจมาก</option>
            <option value="4">4</option>
            <option value="3" selected>3 – ปานกลาง</option>
            <option value="2">2</option>
            <option value="1">1 – ยังไม่มั่นใจ</option>
          </select>
        </div>

        <div class="d-flex justify-content-between">
          <a href="<?= htmlspecialchars($dashboardUrl) ?>" class="btn btn-outline-secondary">← กลับแดชบอร์ด</a>
          <button class="btn btn-primary" type="submit">บันทึกใบงาน</button>
        </div>
      </form>
    </div>
  </div>

  <div class="alert alert-info mt-3">
    <strong>ตัวช่วยคิด:</strong> ใช้โครงประโยค “ฉันเห็นว่า… / ข้อกำหนดคือ… / ฉันตั้งกฎว่า… / ฉันทดสอบแล้ว… และจึงคาดการณ์ว่า…” เพื่อให้คำตอบสั้นและตรงประเด็น
  </div>
</div>

<?php
$FOOT = dirname(__DIR__) . '/includes/student_footer.php';
if (is_file($FOOT)) { include $FOOT; }
?>
</body>
</html>
