// File: assets/js/leaderboard.js
// JavaScript สำหรับหน้า Leaderboard แบบเรียลไทม์

document.addEventListener('DOMContentLoaded', function() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const updateTimeElement = document.getElementById('update-time');

    // ฟังก์ชันสำหรับดึงข้อมูล Leaderboard จาก API
    function fetchLeaderboardData() {
        fetch('../api/get_leaderboard.php') // ✅ Path ไปยัง API
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // ล้างข้อมูลเก่า
                leaderboardBody.innerHTML = ''; 

                if (data.length === 0) {
                    leaderboardBody.innerHTML = '<tr><td colspan="3">ยังไม่มีข้อมูลใน Leaderboard</td></tr>';
                    return;
                }

                data.forEach(item => {
                    const row = document.createElement('tr');
                    // ไฮไลท์แถวของผู้เล่นปัจจุบัน
                    if (item.user_id && item.user_id == CURRENT_USER_ID) { // เปรียบเทียบ user_id ถ้า API ส่งมา
                        row.classList.add('highlight');
                    }

                    // เพิ่ม Class สำหรับ 3 อันดับแรกเพื่อ Style พิเศษ
                    if (item.rank === 1) {
                        row.classList.add('rank-top-1');
                    } else if (item.rank === 2) {
                        row.classList.add('rank-top-2');
                    } else if (item.rank === 3) {
                        row.classList.add('rank-top-3');
                    }

                    row.innerHTML = `
                        <td>${item.rank}</td>
                        <td>${item.name}</td>
                        <td>${item.total_stars} 🌟</td>
                    `;
                    leaderboardBody.appendChild(row);
                });

                // อัปเดตเวลาล่าสุด
                updateTimeElement.textContent = `อัปเดตเมื่อ: ${new Date().toLocaleTimeString('th-TH')}`;
            })
            .catch(error => {
                console.error('Error fetching leaderboard data:', error);
                leaderboardBody.innerHTML = '<tr><td colspan="3" class="text-danger">เกิดข้อผิดพลาดในการโหลด Leaderboard</td></tr>';
                updateTimeElement.textContent = `เกิดข้อผิดพลาด`;
            });
    }

    // เรียกฟังก์ชันเมื่อโหลดหน้าเสร็จครั้งแรก
    fetchLeaderboardData();

    // ตั้งเวลาให้ดึงข้อมูลอัปเดตทุก 5 วินาที (ปรับได้ตามความเหมาะสมกับ Server)
    setInterval(fetchLeaderboardData, 5000); // 5000 ms = 5 วินาที
});