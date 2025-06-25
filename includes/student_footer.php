<footer>
    <div class="footer-box">
        <p class="mb-1">
            พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong><br>
            ครู โรงเรียนบ้านนาอุดม<br>
            สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร
        </p>
        <p class="text-muted mb-0">
            &copy; <?= date("Y") ?> Developed by Mr. Natdanai Suwannatrai. All rights reserved.
        </p>
    </div>
</footer>

<!-- ✅✅✅ เพิ่ม CSS สำหรับ Footer ที่นี่ ✅✅✅ -->
<style>
    footer {
        width: 100%;
        margin-top: auto;
        /* ดันให้อยู่ล่างสุดเสมอ */
        padding: 20px 0;
        text-align: center;
    }

    .footer-box {
        background: rgba(255, 255, 255, 0.85);
        margin: auto;
        padding: 15px 10px;
        border-radius: 15px;
        max-width: 800px;
        font-size: 0.9rem;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        border-top: 2px solid rgba(0, 0, 0, 0.1);
    }

    .footer-box p {
        margin-bottom: 0.25rem;
        color: #4b5563;
    }

    .footer-box strong {
        color: #1d4ed8;
    }

    .footer-box .text-muted {
        color: #6b7280 !important;
    }

    footer,
    #student-footer {
        font-family: 'Kanit', sans-serif;
    }
</style>