<?php
// pages/admin_import_questions.php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/csrf.php';
requireAdmin();

$title = 'นำเข้าข้อสอบ (CSV) – เวอร์ชันเทมเพลตล่าสุด';

if (session_status() === PHP_SESSION_NONE) session_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
$conn->set_charset('utf8mb4');

// ปุ่มย้อนกลับ: ใช้ referer เป็นสำรอง (ถ้า JS ปิด)
$referer  = $_SERVER['HTTP_REFERER'] ?? '';
$returnTo = $referer !== '' ? $referer : '#';

// หัวคอลัมน์ตามเทมเพลตล่าสุด
$EXPECTED_HEADER = [
  "unit", "question_text", "question_image", "difficulty", "active",
  "choice1_text", "choice1_image", "choice1_correct",
  "choice2_text", "choice2_image", "choice2_correct",
  "choice3_text", "choice3_image", "choice3_correct",
  "choice4_text", "choice4_image", "choice4_correct"
];

// ---------- Helpers ----------
function strip_bom($s) { return preg_replace('/^\xEF\xBB\xBF/', '', $s); }
function csv_bool($v): int {
  $v = trim((string)$v);
  if ($v === '') return 0;
  $vU = mb_strtoupper($v, 'UTF-8');
  return in_array($vU, ['1','TRUE','T','YES','Y'], true) ? 1 : 0;
}
function csv_int($v, $default = 0): int {
  $v = trim((string)$v);
  if ($v === '') return (int)$default;
  return (int)$v;
}
function any_filled(...$vals): bool {
  foreach ($vals as $v) { if (trim((string)$v) !== '') return true; }
  return false;
}

// ---------- State ----------
$messages = [];
$errors   = [];
$report   = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!csrf_validate($_POST['csrf'] ?? '')) {
    http_response_code(403);
    $errors[] = 'CSRF token ไม่ถูกต้อง';
  } else {
    $isDryRun          = isset($_POST['dry_run']) ? 1 : 0;
    $purgeBeforeImport = isset($_POST['purge_before_import']) ? 1 : 0;

    if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
      $errors[] = 'อัปโหลดไฟล์ไม่ได้ กรุณาลองใหม่';
    } else {
      $finfo = new finfo(FILEINFO_MIME_TYPE);
      $mime  = $finfo->file($_FILES['csv']['tmp_name']) ?: '';
      $allow = ['text/plain','text/csv','application/vnd.ms-excel','application/csv','text/comma-separated-values'];
      if (!in_array($mime, $allow, true)) {
        $errors[] = "ชนิดไฟล์ไม่รองรับ ($mime) กรุณาอัปโหลด .csv (UTF-8)";
      } else {
        $fp = fopen($_FILES['csv']['tmp_name'], 'r');
        if (!$fp) {
          $errors[] = 'ไม่สามารถเปิดไฟล์ CSV ได้';
        } else {
          $header = fgetcsv($fp);
          if (!$header) {
            $errors[] = 'ไฟล์ว่างเปล่าหรืออ่าน Header ไม่ได้';
          } else {
            $header[0] = strip_bom($header[0]);
            $normalized = array_map('trim', $header);

            if ($normalized !== $EXPECTED_HEADER) {
              $errors[] = 'หัวคอลัมน์ไม่ตรงตามเทมเพลตล่าสุด กรุณาใช้หัวคอลัมน์ต่อไปนี้ (เรียงลำดับเป๊ะ): '
                . implode(', ', $EXPECTED_HEADER);
            } else {
              $line = 1;
              $rows = [];
              $unitsInFile = [];

              while (($row = fgetcsv($fp)) !== false) {
                $line++;
                if (count(array_filter($row, fn($x)=>trim((string)$x) !== '')) === 0) continue;

                if (count($row) > count($EXPECTED_HEADER)) {
                  $row = array_slice($row, 0, count($EXPECTED_HEADER));
                } elseif (count($row) < count($EXPECTED_HEADER)) {
                  $row = array_pad($row, count($EXPECTED_HEADER), '');
                }

                [
                  $unit, $qtext, $qimg, $diff, $act,
                  $t1, $i1, $ok1,
                  $t2, $i2, $ok2,
                  $t3, $i3, $ok3,
                  $t4, $i4, $ok4
                ] = array_map('trim', $row);

                if ($unit === '') { $errors[] = "บรรทัดที่ $line: unit ว่าง"; continue; }
                if ($qtext === '') { $errors[] = "บรรทัดที่ $line: question_text ว่าง"; continue; }

                $validChoicesRaw = [
                  ['t'=>$t1, 'img'=>$i1, 'ok'=>csv_bool($ok1)],
                  ['t'=>$t2, 'img'=>$i2, 'ok'=>csv_bool($ok2)],
                  ['t'=>$t3, 'img'=>$i3, 'ok'=>csv_bool($ok3)],
                  ['t'=>$t4, 'img'=>$i4, 'ok'=>csv_bool($ok4)],
                ];
                $validChoices = [];
                foreach ($validChoicesRaw as $c) {
                  if (any_filled($c['t'], $c['img'])) {
                    if ($c['ok'] === 1 && !any_filled($c['t'], $c['img'])) {
                      $errors[] = "บรรทัดที่ $line: ตัวเลือกถูกต้องมีเนื้อหาว่าง";
                      continue 2;
                    }
                    $validChoices[] = $c;
                  }
                }
                if (count($validChoices) < 2) {
                  $errors[] = "บรรทัดที่ $line: ต้องมีตัวเลือกอย่างน้อย 2 ตัว (มีข้อความหรือรูป)";
                  continue;
                }
                $hasCorrect = false;
                foreach ($validChoices as $c) { if ($c['ok'] === 1) { $hasCorrect = true; break; } }
                if (!$hasCorrect) {
                  $errors[] = "บรรทัดที่ $line: ไม่มีตัวเลือกที่ถูกต้อง (choiceN_correct=1)";
                  continue;
                }

                $rows[] = [
                  'line'  => $line,
                  'unit'  => $unit,
                  'qtext' => $qtext,
                  'qimg'  => ($qimg !== '' ? $qimg : null),
                  'diff'  => max(1, csv_int($diff, 1)),
                  'act'   => csv_bool($act),
                  'choices' => $validChoices
                ];
                $unitsInFile[$unit] = true;
              }
              fclose($fp);

              $inserted = 0; $skipped = 0; $purged = 0;

              if ($isDryRun) {
                $messages[] = 'โหมด Dry-run: ตรวจสอบโครงสร้างและข้อมูลเรียบร้อย (ยังไม่บันทึกลงฐานข้อมูล)';
                $report = [
                  'units'     => array_keys($unitsInFile),
                  'totalRows' => count($rows),
                  'inserted'  => 0,
                  'skipped'   => 0,
                  'purged'    => 0,
                  'dry_run'   => true
                ];
              } else {
                $conn->begin_transaction();
                try {
                  if ($purgeBeforeImport && !empty($unitsInFile)) {
                    $units = array_keys($unitsInFile);
                    $ph = implode(',', array_fill(0, count($units), '?'));
                    $types = str_repeat('s', count($units));
                    $sql = "DELETE FROM questions WHERE unit IN ($ph)";
                    $st = $conn->prepare($sql);
                    $params = []; $params[] = &$types;
                    foreach ($units as $i => $u) $params[] = &$units[$i];
                    call_user_func_array([$st, 'bind_param'], $params);
                    $st->execute();
                    $purged = $st->affected_rows;
                  }

                  $qStmt = $conn->prepare(
                    "INSERT INTO questions(text, image_path, unit, difficulty, active)
                     VALUES(?,?,?,?,?)"
                  );
                  $cStmt = $conn->prepare(
                    "INSERT INTO choices(question_id, text, image_path, is_correct)
                     VALUES(?,?,?,?)"
                  );

                  foreach ($rows as $r) {
                    if ($r['qtext'] === '' || empty($r['choices'])) { $skipped++; continue; }

                    $qStmt->bind_param('sssii', $r['qtext'], $r['qimg'], $r['unit'], $r['diff'], $r['act']);
                    $qStmt->execute();
                    $qid = $qStmt->insert_id;

                    foreach ($r['choices'] as $c) {
                      $txt = ($c['t'] !== '' ? $c['t'] : null);
                      $img = ($c['img'] !== '' ? $c['img'] : null);
                      $ok  = (int)$c['ok'];
                      $cStmt->bind_param('issi', $qid, $txt, $img, $ok);
                      $cStmt->execute();
                    }
                    $inserted++;
                  }

                  $conn->commit();
                  $messages[] = "นำเข้าข้อสอบสำเร็จ $inserted ข้อ (ลบก่อนนำเข้า: $purged ระเบียน, ข้าม: $skipped ข้อ)";
                  $report = [
                    'units'     => array_keys($unitsInFile),
                    'totalRows' => count($rows),
                    'inserted'  => $inserted,
                    'skipped'   => $skipped,
                    'purged'    => $purged,
                    'dry_run'   => false
                  ];
                } catch (Throwable $e) {
                  $conn->rollback();
                  $errors[] = 'เกิดข้อผิดพลาดระหว่างบันทึก: '.$e->getMessage();
                }
              }
            }
          }
        }
      }
    }
  }
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<div class="container my-4">

  <!-- แถบหัวเรื่อง + ปุ่มย้อนกลับ -->
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="mb-0"><?= htmlspecialchars($title) ?></h3>
    <a href="<?= htmlspecialchars($returnTo) ?>"
       class="btn btn-outline-secondary"
       onclick="if (window.history.length > 1) { history.back(); return false; }">
       ← ย้อนกลับ
    </a>
  </div>

  <?php foreach ($messages as $m): ?>
    <div class="alert alert-success"><?= htmlspecialchars($m) ?></div>
  <?php endforeach; ?>
  <?php foreach ($errors as $er): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($er) ?></div>
  <?php endforeach; ?>

  <?php if ($report): ?>
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">สรุปผลการประมวลผล</h5>
        <ul class="mb-3">
          <li>หน่วยที่พบในไฟล์: <strong><?= htmlspecialchars(implode(', ', $report['units'])) ?: '-' ?></strong></li>
          <li>จำนวนแถวข้อมูล (ไม่รวม Header): <strong><?= (int)$report['totalRows'] ?></strong></li>
          <li>บันทึกเพิ่ม: <span class="badge bg-success"><?= (int)$report['inserted'] ?></span></li>
          <li>ข้าม: <span class="badge bg-secondary"><?= (int)$report['skipped'] ?></span></li>
          <li>ลบก่อนนำเข้า: <span class="badge bg-warning text-dark"><?= (int)$report['purged'] ?></span></li>
          <li>โหมด: <span class="badge <?= $report['dry_run'] ? 'bg-info text-dark' : 'bg-primary' ?>">
              <?= $report['dry_run'] ? 'Dry-run (ไม่บันทึก)' : 'Commit (บันทึกจริง)' ?>
          </span></li>
        </ul>
        <div class="small text-muted">
          *หากเลือก “ลบก่อนนำเข้า” ระบบจะลบคำถามของหน่วยที่อยู่ในไฟล์จากตาราง <code>questions</code> (และ <code>choices</code> จะถูกลบตามด้วย ON DELETE CASCADE ถ้ามีการตั้งค่า)
        </div>
      </div>
    </div>
  <?php endif; ?>

  <div class="card p-3 shadow-sm">
    <form method="post" enctype="multipart/form-data">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token()) ?>">

      <div class="mb-3">
        <label class="form-label fw-semibold">เลือกไฟล์ CSV (UTF-8)</label>
        <input type="file" name="csv" accept=".csv,text/csv" class="form-control" required>
        <div class="form-text">
          ต้องใช้เทมเพลตหัวคอลัมน์ต่อไปนี้ (ลำดับต้องตรงกัน):
          <code><?= htmlspecialchars(implode(', ', $EXPECTED_HEADER)) ?></code>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="dry_run" name="dry_run">
            <label class="form-check-label" for="dry_run">ทดลองประมวลผลก่อน (Dry-run) – ไม่บันทึกลงฐานข้อมูล</label>
          </div>
        </div>
        <div class="col-md-8">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="purge_before_import" name="purge_before_import">
            <label class="form-check-label" for="purge_before_import">
              ลบคำถามเดิมของ “ทุกหน่วย” ที่อยู่ในไฟล์นี้ ก่อนนำเข้า (ใช้ด้วยความระมัดระวัง)
            </label>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-primary" type="submit">อัปโหลดและประมวลผล</button>
        <a class="btn btn-outline-secondary" href="<?= htmlspecialchars($_SERVER['REQUEST_URI']) ?>">ล้างแบบฟอร์ม</a>
        <!-- ปุ่มย้อนกลับ (สำรองสำหรับพื้นที่ล่าง) -->
        <a href="<?= htmlspecialchars($returnTo) ?>"
           class="btn btn-outline-dark"
           onclick="if (window.history.length > 1) { history.back(); return false; }">
           ← ย้อนกลับ
        </a>
      </div>
    </form>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5 class="card-title">ตัวอย่างการกรอก (คู่มือย่อ)</h5>
      <ul class="mb-2">
        <li><code>unit</code> : ชื่อหน่วย/บท เช่น <code>logic</code>, <code>algorithm</code>, <code>text_algo</code>, <code>pseudocode</code>, <code>flowchart</code></li>
        <li><code>question_text</code> : ข้อความคำถาม (ต้องมี)</li>
        <li><code>question_image</code> : พาธรูป/URL (ว่างได้)</li>
        <li><code>difficulty</code> : ตัวเลขระดับความยาก (แนะนำ 1–3)</li>
        <li><code>active</code> : 1 = ใช้งานสุ่ม, 0 = ปิด</li>
        <li><code>choiceN_text</code> / <code>choiceN_image</code> : ต้องมีอย่างน้อยหนึ่งอย่าง (ข้อความหรือรูป)</li>
        <li><code>choiceN_correct</code> : 1/0 ต้องมีอย่างน้อยหนึ่งตัวเลือกที่เป็น 1</li>
      </ul>
      <div class="small text-muted">
        เคล็ดลับ: เซฟ CSV เป็น UTF-8 (แนะนำ “UTF-8 with BOM”) เพื่อกันภาษาไทยเพี้ยนในบางโปรแกรม
      </div>
    </div>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
