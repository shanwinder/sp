// File: assets/js/shared/game_common.js
// ฟังก์ชันและตัวแปรที่ใช้ร่วมกันในเกม
// ปรับปรุงสำหรับระบบคะแนน 3 ดาวและระบบฉายา

// ฟังก์ชันสำหรับแอนิเมชันเมื่อคะแนนรวมเปลี่ยน (เพิ่มทีละ 5)
window.animateScoreChange = function (current, target) {
    // total-score เป็น id ของ element ที่แสดงคะแนนรวมบน Header ของเกม
    const scoreEl = document.getElementById('total-score');
    if (!scoreEl) return; // หากไม่มี element นี้บนหน้าเว็บ ก็ไม่ต้องทำอะไร

    const step = 5; // กำหนดให้เพิ่มทีละ 5 คะแนนในการแอนิเมชันแต่ละครั้ง
    const delay = 30; // ความหน่วง 30ms ระหว่างการเพิ่มคะแนนแต่ละ step

    // หากคะแนนปัจจุบันมากกว่าหรือเท่ากับคะแนนเป้าหมายแล้ว ก็แสดงคะแนนเป้าหมายและจบแอนิเมชัน
    if (current >= target) {
        scoreEl.textContent = target; // แสดงคะแนนเป้าหมาย
        scoreEl.classList.add('score-animate'); // เพิ่ม class เพื่อกระตุ้น CSS animation
        setTimeout(() => {
            scoreEl.classList.remove('score-animate'); // ลบ class ออกหลังจาก animation จบ
        }, 600); // ระยะเวลาแอนิเมชัน pop-score ใน CSS คือ 0.6 วินาที
        return;
    }

    let value = current; // เริ่มต้นค่าแอนิเมชันจากคะแนนปัจจุบัน
    // สร้าง interval เพื่อเพิ่มค่าคะแนนทีละ step
    const interval = setInterval(() => {
        value += step; // เพิ่มคะแนน
        if (value >= target) { // หากคะแนนที่เพิ่มเกินหรือเท่ากับคะแนนเป้าหมาย
            value = target; // กำหนดให้เป็นคะแนนเป้าหมาย
            clearInterval(interval); // หยุด interval
        }
        scoreEl.textContent = value; // อัปเดตข้อความคะแนน
        // Trigger CSS animation: เพิ่ม class สั้นๆ เพื่อให้แอนิเมชันทำงานในแต่ละ step
        scoreEl.classList.add('score-animate');
        setTimeout(() => {
            scoreEl.classList.remove('score-animate'); // ลบ class ออกอย่างรวดเร็ว
        }, 200); // ระยะเวลาที่ค้าง class ไว้สั้นๆ (0.2 วินาที)
    }, delay); // หน่วงเวลาตามที่กำหนด
};

/**
 * ฟังก์ชันสำหรับส่งผลลัพธ์การเล่นด่านไปยัง Backend (PHP)
 * @param {number} stageId ID ของด่านที่เล่น
 * @param {number} starsEarned จำนวนดาวที่นักเรียนได้รับในด่านนี้ (0-3)
 * @param {number} durationSeconds ระยะเวลาที่ใช้ในการเล่นด่าน (หน่วยเป็นวินาที)
 * @param {number} attempts จำนวนครั้งที่พยายามก่อนสำเร็จ
 */
// กำหนดค่าเริ่มต้นให้กับ parameter เพื่อป้องกันข้อผิดพลาดหากไม่ได้ส่งค่ามา
window.sendResult = function (stageId, starsEarned, durationSeconds = 0, attempts = 1) {
    // ตรวจสอบความถูกต้องของ stageId และ starsEarned
    if (typeof stageId !== 'number' || typeof starsEarned !== 'number' || starsEarned < 0 || starsEarned > 3) {
        console.error('Invalid stageId or starsEarned provided to sendResult.');
        return; // หยุดการทำงานหากข้อมูลไม่ถูกต้อง
    }

    // สร้าง FormData object เพื่อส่งข้อมูลไปยัง PHP (เป็นวิธีที่แนะนำสำหรับการส่งข้อมูล POST)
    const formData = new FormData();
    formData.append('stage_id', stageId);
    formData.append('stars_earned', starsEarned); // ✅ ส่งจำนวนดาวที่ได้
    formData.append('duration_seconds', durationSeconds); // เพิ่ม duration_seconds
    formData.append('attempts', attempts); // เพิ่ม attempts

    // console.log(`Sending result for User ID: ${USER_ID}, Stage ID: ${stageId}, Stars: ${starsEarned}`); // สำหรับ Debug

    // ใช้ Fetch API เพื่อส่งข้อมูลไปยัง submit_stage_score.php
    fetch('../api/submit_stage_score.php', { // ✅ Path ไปยังไฟล์ API ใน Backend ต้องถูกต้อง
        method: 'POST', // กำหนดเป็น HTTP POST method
        body: formData // ส่ง FormData object ที่สร้างไว้
    })
        .then(response => response.json()) // แปลงการตอบกลับจาก Server เป็น JSON
        .then(data => {
            if (data.status === 'ok') { // หาก Server ตอบกลับว่าสำเร็จ
                console.log('Score submitted successfully:', data.stars_saved, 'stars.');
                // เมื่อส่งคะแนนสำเร็จ ให้อัปเดตคะแนนรวมดาวและฉายาบนหน้าจอ
                window.updateTotalStarsAndAchievement();
                // หากต้องการให้เกมไปยังด่านถัดไปอัตโนมัติหลังจากส่งคะแนน
                window.triggerAutoNextStage();
            } else {
                console.error('Error submitting score:', data.message); // แสดงข้อผิดพลาดจาก Server
            }
        })
        .catch(error => {
            console.error('Network error submitting score:', error); // แสดงข้อผิดพลาดในการเชื่อมต่อเครือข่าย
        });
};

/**
 * ฟังก์ชันสำหรับดึงและอัปเดตคะแนนดาวรวมและฉายาปัจจุบันของนักเรียน
 * เรียกใช้เมื่อมีการโหลดหน้า Dashboard, หน้าเกม, หรือเมื่อมีการส่งคะแนนด่านสำเร็จ
 */
window.updateTotalStarsAndAchievement = function () {
    fetch('../api/get_current_achievement.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                console.error('Error fetching achievement:', data.message);
                return;
            }

            // อัปเดตคะแนนรวมดาวบน Header ของเกม
            const scoreEl = document.getElementById('total-score');
            if (scoreEl) {
                const currentScore = parseInt(scoreEl.textContent) || 0;
                window.animateScoreChange(currentScore, data.total_stars);
            }

            // อัปเดตฉายาบนหน้า Dashboard (element ที่มี id='current-achievement')
            const achievementDashboardElement = document.getElementById('current-achievement');
            if (achievementDashboardElement) {
                achievementDashboardElement.textContent = data.current_title;
                // ✅ เพิ่มการกำหนด class CSS ให้กับฉายาใน Dashboard
                achievementDashboardElement.className = data.current_title_class; // กำหนด class จากข้อมูลที่ได้
            }

            // อัปเดตฉายาบน Header ขณะเล่นเกม (element ที่มี id='current-achievement-game-header')
            const achievementGameHeaderElement = document.getElementById('current-achievement-game-header');
            if (achievementGameHeaderElement) {
                achievementGameHeaderElement.textContent = data.current_title;
                // ✅ เพิ่มการกำหนด class CSS ให้กับฉายาใน Header ของเกม
                // ลบ class เดิมออกก่อนเพื่อป้องกัน class ซ้อนกัน
                achievementGameHeaderElement.className = '';
                achievementGameHeaderElement.classList.add(data.current_title_class); // กำหนด class ใหม่
            }

            console.log('Total Stars:', data.total_stars, 'Current Title:', data.current_title, 'Class:', data.current_title_class); // แสดงผลใน Console (สำหรับ Debug)
        })
        .catch(error => {
            console.error('Network error fetching achievement:', error);
        });
};

// ฟังก์ชันสำหรับอัปเดต Score Bar (ใช้เมื่อ DOM โหลดเสร็จ)
// ✅ ฟังก์ชันนี้ถูกปรับให้เรียกใช้ window.updateTotalStarsAndAchievement() แล้ว
//    แต่ยังคงชื่อฟังก์ชันเดิมไว้เพื่อความเข้ากันได้กับโค้ดเดิมที่อาจเรียกโดยตรง
window.updateScoreBar = function () {
    window.updateTotalStarsAndAchievement(); // เรียกฟังก์ชันรวมแทน
};


// ฟังก์ชันสำหรับแสดงปุ่มไปด่านถัดไปพร้อมแถบความคืบหน้าแบบถอยหลัง
window.triggerAutoNextStage = function () {
    const nextBtn = document.getElementById("nextStageBtn"); // ปุ่ม "ไปด่านถัดไป"
    const secondsSpan = document.getElementById("seconds"); // ส่วนแสดงวินาทีถอยหลัง
    const overlay = document.getElementById("next-progress-fill"); // แถบความคืบหน้า

    if (!nextBtn || !secondsSpan || !overlay) return; // หยุดการทำงานหากไม่พบ element

    nextBtn.style.display = 'inline-block'; // แสดงปุ่ม "ไปด่านถัดไป"
    let count = 10; // เริ่มต้นนับถอยหลังจาก 10 วินาที
    secondsSpan.textContent = count; // อัปเดตตัวเลขวินาที

    // Reset progress bar for animation: ตั้งค่าแถบความคืบหน้าให้กลับไปที่ 0% และไม่มี transition เพื่อเตรียมพร้อมสำหรับ animation ใหม่
    overlay.style.transition = 'none';
    overlay.style.width = '0%';
    // Force reflow: บังคับให้เบราว์เซอร์ทำการ render ใหม่ทันที ก่อนจะเริ่ม transition ใหม่
    void overlay.offsetWidth;

    // Start new transition: เริ่ม animation แถบความคืบหน้าจาก 0% ไป 100% ภายใน 10 วินาที
    overlay.style.transition = 'width 10s linear';
    overlay.style.width = '100%';

    // ตั้งเวลาถอยหลังทุก 1 วินาที
    const timer = setInterval(() => {
        count--; // ลดจำนวนวินาที
        secondsSpan.textContent = count; // อัปเดตตัวเลขบนหน้าจอ
        if (count <= 0) { // หากนับถอยหลังครบ 0
            clearInterval(timer); // หยุด interval
            window.location.href = nextBtn.href; // เปลี่ยนหน้าไปยังด่านถัดไป
        }
    }, 1000); // ทำงานทุก 1000 มิลลิวินาที (1 วินาที)
};

// เรียก updateTotalStarsAndAchievement เมื่อ DOM โหลดเสร็จ เพื่อแสดงคะแนนและฉายาเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่าอยู่บนหน้าที่มี element ที่จะแสดงผลคะแนนรวมหรือฉายาหรือไม่
    // เพื่อให้แน่ใจว่าฟังก์ชันจะทำงานเฉพาะในหน้าที่จำเป็น และไม่เกิด error ในหน้าอื่น ๆ ที่ไม่มี element เหล่านี้
    if (document.getElementById('total-score') || document.getElementById('current-achievement')) {
        window.updateTotalStarsAndAchievement();
    }
});