FROM php:8.2-apache

# คัดลอกไฟล์ทั้งหมดไปไว้ใน apache server root
COPY . /var/www/html/

# เปิดพอร์ต 80
EXPOSE 80