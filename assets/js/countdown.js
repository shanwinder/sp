// countdown.js

function triggerAutoNextStage() {
  console.log("✅ เริ่มนับถอยหลังแล้ว");

  const nextBtn = document.getElementById("nextStageBtn");
  const secondsSpan = document.getElementById("seconds");
  const progressBarOverlay = document.getElementById("progress-overlay");

  // เพิ่ม console.log เพื่อตรวจสอบว่าหา Element เจอหรือไม่
  console.log("nextStageBtn:", nextBtn);
  console.log("secondsSpan:", secondsSpan);
  console.log("progressBarOverlay:", progressBarOverlay);

  if (!nextBtn || !secondsSpan || !progressBarOverlay) {
    console.warn("❌ ไม่พบองค์ประกอบ DOM สำหรับ countdown");
    return; // ถ้าหาไม่เจอ จะออกจากฟังก์ชันทันที
  }

  nextBtn.style.display = 'inline-block'; // แสดงปุ่ม
  let count = 10;
  secondsSpan.textContent = count;
  progressBarOverlay.style.width = '100%'; // เริ่มต้น progress bar เต็ม

  const timer = setInterval(() => {
    count--;
    secondsSpan.textContent = count;
    progressBarOverlay.style.width = (count * 10) + "%"; // ลดขนาด progress bar

    if (count <= 0) {
      clearInterval(timer);
      window.location.href = nextBtn.href; // ลิงก์ไปยังหน้าถัดไป
    }
  }, 1000);
}

window.triggerAutoNextStage = triggerAutoNextStage;