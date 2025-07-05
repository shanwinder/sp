// File: assets/js/shared/game_common.js
// ฟังก์ชันและตัวแปรที่ใช้ร่วมกันในเกม
// ปรับปรุงสำหรับระบบคะแนน 3 ดาวและระบบฉายา (แก้ไข SyntaxError: DOMTokenList)

// ฟังก์ชันสำหรับแอนิเมชันเมื่อคะแนนรวมเปลี่ยน (เพิ่มทีละ 5)
window.animateScoreChange = function (current, target) {
    const scoreEl = document.getElementById('total-score');
    if (!scoreEl) return;

    const step = 5;
    const delay = 30;

    if (current >= target) {
        scoreEl.textContent = target;
        scoreEl.classList.add('score-animate');
        setTimeout(() => {
            scoreEl.classList.remove('score-animate');
        }, 600);
        return;
    }

    let value = current;
    const interval = setInterval(() => {
        value += step;
        if (value >= target) {
            value = target;
            clearInterval(interval);
        }
        scoreEl.textContent = value;
        scoreEl.classList.add('score-animate');
        setTimeout(() => {
            scoreEl.classList.remove('score-animate');
        }, 200);
    }, delay);
};

/**
 * ฟังก์ชันสำหรับส่งผลลัพธ์การเล่นด่านไปยัง Backend (PHP)
 * @param {number} stageId ID ของด่านที่เล่น
 * @param {number} starsEarned จำนวนดาวที่นักเรียนได้รับในด่านนี้ (0-3)
 * @param {number} durationSeconds ระยะเวลาที่ใช้ในการเล่นด่าน (หน่วยเป็นวินาที)
 * @param {number} attempts จำนวนครั้งที่พยายามก่อนสำเร็จ
 */
window.sendResult = function(stageId, starsEarned, durationSeconds = 0, attempts = 1) {
    if (typeof stageId !== 'number' || typeof starsEarned !== 'number' || starsEarned < 0 || starsEarned > 3) {
        console.error('Invalid stageId or starsEarned provided to sendResult.');
        return;
    }

    const formData = new FormData();
    formData.append('stage_id', stageId);
    formData.append('stars_earned', starsEarned);
    formData.append('duration_seconds', durationSeconds);
    formData.append('attempts', attempts);

    fetch('../api/submit_stage_score.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            console.log('Score submitted successfully:', data.stars_saved, 'stars.');
            window.updateTotalStarsAndAchievement();
            window.triggerAutoNextStage();
        } else {
            console.error('Error submitting score:', data.message);
        }
    })
    .catch(error => {
        console.error('Network error submitting score:', error);
    });
};

/**
 * ฟังก์ชันสำหรับดึงและอัปเดตคะแนนดาวรวมและฉายาปัจจุบันของนักเรียน
 * เรียกใช้เมื่อมีการโหลดหน้า Dashboard หรือเมื่อมีการส่งคะแนนด่านสำเร็จ
 */
window.updateTotalStarsAndAchievement = function() {
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
            // ✅ แก้ไข: ตรวจสอบว่ามี data.current_title_class ก่อนที่จะกำหนด
            if (data.current_title_class) { // ถ้ามีค่า ไม่ใช่ null หรือ empty string
                // ลบ class เดิมออกก่อนเพื่อป้องกัน class ซ้อนกัน
                achievementDashboardElement.className = ''; 
                achievementDashboardElement.classList.add(data.current_title_class);
            } else {
                // ถ้าไม่มี class ให้ลบ class เดิมออก
                achievementDashboardElement.className = '';
            }
        }

        // อัปเดตฉายาบน Header ขณะเล่นเกม (element ที่มี id='current-achievement-game-header')
        const achievementGameHeaderElement = document.getElementById('current-achievement-game-header');
        if (achievementGameHeaderElement) {
            achievementGameHeaderElement.textContent = data.current_title;
            // ✅ แก้ไข: ตรวจสอบว่ามี data.current_title_class ก่อนที่จะกำหนด
            if (data.current_title_class) { // ถ้ามีค่า ไม่ใช่ null หรือ empty string
                // ลบ class เดิมออกก่อนเพื่อป้องกัน class ซ้อนกัน
                achievementGameHeaderElement.className = ''; 
                achievementGameHeaderElement.classList.add(data.current_title_class);
            } else {
                // ถ้าไม่มี class ให้ลบ class เดิมออก
                achievementGameHeaderElement.className = '';
            }
        }

        console.log('Total Stars:', data.total_stars, 'Current Title:', data.current_title, 'Class:', data.current_title_class);
    })
    .catch(error => {
        console.error('Network error fetching achievement:', error);
    });
};

// ฟังก์ชันสำหรับอัปเดต Score Bar (ใช้เมื่อ DOM โหลดเสร็จ)
window.updateScoreBar = function () {
    window.updateTotalStarsAndAchievement();
};


// ฟังก์ชันสำหรับแสดงปุ่มไปด่านถัดไปพร้อมแถบความคืบหน้าแบบถอยหลัง
window.triggerAutoNextStage = function () {
    const nextBtn = document.getElementById("nextStageBtn");
    const secondsSpan = document.getElementById("seconds");
    const overlay = document.getElementById("next-progress-fill");

    if (!nextBtn || !secondsSpan || !overlay) return;

    nextBtn.style.display = 'inline-block';
    let count = 10;
    secondsSpan.textContent = count;

    overlay.style.transition = 'none';
    overlay.style.width = '0%';
    void overlay.offsetWidth; 

    overlay.style.transition = 'width 10s linear';
    overlay.style.width = '100%';

    const timer = setInterval(() => {
        count--;
        secondsSpan.textContent = count;
        if (count <= 0) {
            clearInterval(timer);
            window.location.href = nextBtn.href;
        }
    }, 1000);
};

// เรียก updateTotalStarsAndAchievement เมื่อ DOM โหลดเสร็จ เพื่อแสดงคะแนนและฉายาเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('total-score') || document.getElementById('current-achievement')) {
        window.updateTotalStarsAndAchievement();
    }
});