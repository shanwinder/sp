<?php
if (session_status()===PHP_SESSION_NONE) session_start();
require_once '../includes/auth.php';
require_once '../includes/db.php';
requireStudent();

$studentName = $_SESSION['display_name'] ?? $_SESSION['name'] ?? $_SESSION['username'] ?? 'นักเรียน';
$userId = (int)($_SESSION['user_id'] ?? 0);

/* ช่วยเลือกแดชบอร์ด */
function pick_dashboard_url(): string {
  foreach (['../dashboard.php','dashboard.php','../index.php','index.php'] as $p) {
    $abs = realpath(__DIR__ . '/' . $p);
    if ($abs && is_file($abs)) return $p;
  }
  return 'javascript:history.back()';
}
$dashboardUrl = pick_dashboard_url();

/* POST: บันทึกคร่าว ๆ (auto_score = นับช่องที่ไม่ว่าง) */
$ok = null; $errors = [];
if ($_SERVER['REQUEST_METHOD']==='POST') {
  $prompt = (int)($_POST['prompt_id'] ?? 1);
  $obs = trim($_POST['step_observe'] ?? '');
  $grp = trim($_POST['step_group'] ?? '');
  $unit= trim($_POST['step_unit'] ?? '');
  $rule= trim($_POST['step_rule'] ?? '');
  $test= trim($_POST['step_test'] ?? '');
  $pred= trim($_POST['step_predict'] ?? '');
  $conf= (int)($_POST['confidence'] ?? 0);

  if (!$obs||!$grp||!$unit||!$rule||!$test||!$pred) $errors[]='กรอกให้ครบทั้ง 6 ขั้น';
  if (!$errors) {
    $filled = 0;
    foreach ([$obs,$grp,$unit,$rule,$test,$pred] as $x) if (mb_strlen($x)>=3) $filled++;
    $auto = min(6, $filled); // 0..6

    $sql = "INSERT INTO worksheet_stage2
      (user_id, prompt_id, step_observe, step_group, step_unit, step_rule, step_test, step_predict, confidence, auto_score)
      VALUES(?,?,?,?,?,?,?,?,?,?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iissssssii', $userId,$prompt,$obs,$grp,$unit,$rule,$test,$pred,$conf,$auto);
    $ok = $stmt->execute();
    if (!$ok) $errors[] = 'บันทึกไม่สำเร็จ: '.$conn->error;
  }
}
?>
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>ใบงานออนไลน์ • ด่านที่ 2 (ลำดับ/รูปแบบ)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
  <div class="container">
    <span class="navbar-brand fw-bold">ใบงานออนไลน์ • ด่านที่ 2</span>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a class="btn btn-outline-secondary btn-sm" href="<?= htmlspecialchars($dashboardUrl) ?>">← แดชบอร์ด</a>
      <span class="badge text-bg-light">👤 <?= htmlspecialchars($studentName) ?></span>
    </div>
  </div>
</nav>

<div class="container my-4">
  <?php if ($ok && !$errors): ?>
    <div class="alert alert-success">บันทึกใบงานเรียบร้อยแล้ว!</div>
  <?php elseif ($errors): ?>
    <div class="alert alert-danger"><?php foreach ($errors as $e) echo '<div>'.htmlspecialchars($e).'</div>'; ?></div>
  <?php endif; ?>

  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <h5 class="mb-2">เลือกโจทย์ (เกี่ยวเนื่องกับด่านที่ 2)</h5>
      <form method="post" class="needs-validation" novalidate>
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="prompt_id" id="p1" value="1" checked>
              <label class="form-check-label" for="p1">
                โจทย์ A: 🔺 🔷 ⚫ | 🔺 🔷 ⚫ | 🔺 🔷 ⚫ | <strong>? ? ?</strong>
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="prompt_id" id="p2" value="2">
              <label class="form-check-label" for="p2">
                โจทย์ B: ⬛⬜⬜ ⬛⬜⬜ ⬛⬜⬜ <strong>? ? ?</strong>
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="prompt_id" id="p3" value="3">
              <label class="form-check-label" for="p3">
                โจทย์ C: 2, 4, 6, 2, 4, 6, <strong>? ? ?</strong>
              </label>
            </div>
          </div>
        </div>

        <hr>

        <div class="mb-3">
          <label class="form-label">1) สังเกต (เห็นอะไรซ้ำ ๆ / สลับกัน?)</label>
          <textarea class="form-control" name="step_observe" rows="2" required placeholder="ฉันเห็นว่า… ลำดับเป็นแบบ…"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">2) จัดกลุ่ม (ตัดเป็นช่วงละกี่ตัว?)</label>
          <textarea class="form-control" name="step_group" rows="2" required placeholder="ตัดเป็นช่วงละ … และแต่ละช่วงเหมือนกันคือ…"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">3) หน่วยซ้ำ (เขียนหน่วยชัด ๆ)</label>
          <input type="text" class="form-control" name="step_unit" required placeholder="เช่น 🔺🔷⚫ หรือ 2,4,6">
        </div>

        <div class="mb-3">
          <label class="form-label">4) ตั้งกฎ (บอกเป็นคำพูดง่าย ๆ)</label>
          <textarea class="form-control" name="step_rule" rows="2" required placeholder="เช่น ทำซ้ำหน่วยเดิม ความยาว 3 ไปเรื่อย ๆ"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">5) ทดสอบ (ลองเติม 1–2 ช่วงเพื่อเช็กว่าเวิร์ก)</label>
          <textarea class="form-control" name="step_test" rows="2" required placeholder="ลองเติมแล้วได้… ซึ่งตรง/ไม่ตรงเพราะ…"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">6) ทำนาย (ค่าถัดไป/อีก 3 ค่า)</label>
          <input type="text" class="form-control" name="step_predict" required placeholder="เช่น 🔺 🔷 ⚫ หรือ 2,4,6">
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

        <div class="d-flex gap-2">
          <a href="<?= htmlspecialchars($dashboardUrl) ?>" class="btn btn-outline-secondary">← กลับแดชบอร์ด</a>
          <button class="btn btn-primary" type="submit">บันทึกใบงาน</button>
        </div>
      </form>
    </div>
  </div>

  <div class="alert alert-info">
    <strong>เคล็ดลับ:</strong> ถ้า “หน่วยซ้ำ” ถูกต้อง ข้อ 4–6 จะเขียนได้ง่ายและไม่ขัดแย้งกัน
  </div>
</div>
</body>
</html>
