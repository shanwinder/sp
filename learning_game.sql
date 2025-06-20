@ -3,7 +3,7 @@
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2025 at 09:28 AM
-- Generation Time: Jun 20, 2025 at 10:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

@ -23,50 +23,6 @@ SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_logs`
--

CREATE TABLE `game_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `action` enum('start','submit','hint','pass','fail') NOT NULL,
  `detail` text DEFAULT NULL,
  `logged_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `attempts` int(11) DEFAULT 1,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stages`
--
@ -80,72 +36,17 @@ CREATE TABLE `stages` (
  `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_level` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','admin') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
-- Dumping data for table `stages`
--

INSERT INTO `users` (`id`, `student_id`, `name`, `class_level`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'ณัฐดนัย สุวรรณไตรย์', NULL, '$2y$10$WQgCqFZZy4U9P2kc4tstR.PxSysPCpZoKnIMxqh2ubk3XSP7ua9mi', 'admin', '2025-06-19 03:45:00'),
(3, '2644', 'เด็กชายปิยะวิทย์  บุญมาตร์', 'ป.4', '$2y$10$cQnFLo17chP327vuF9v1CuAwvfAv/fn62J.RS3BecsUT62JpWN76G', 'student', '2025-06-19 04:13:29'),
(4, '2645', 'เด็กชายหนึ่งธันวา  ตาทิพย์', 'ป.4', '$2y$10$F0x0xfytJOXrAGUVZN/hSecNxA91e7QZvWoB.v8sen.FukezqVcAi', 'student', '2025-06-19 04:13:29'),
(5, '2646', 'เด็กชายชุติพนธ์  ฉิมพลี', 'ป.4', '$2y$10$3ZugCbzk6B9QRVmyP.Jkb.Q0XoSnWaZMxI/CtnjgssDCmEGxHfUm2', 'student', '2025-06-19 04:13:29'),
(6, '2647', 'เด็กชายวิทวัส  เติมศิลป์', 'ป.4', '$2y$10$iuOuzyXTzEiv.vamamBT9u40hLYz5QPNTpVEwFH3XlBf.PabapjPG', 'student', '2025-06-19 04:13:29'),
(7, '2648', 'เด็กชายวีรศรุต  วงศ์สมัคร', 'ป.4', '$2y$10$EXYDr9b9tgEt8NXt6LEvRO1kLlNYNkP3o34AqOeOB1uUfuh2JRPg2', 'student', '2025-06-19 04:13:29'),
(8, '2649', 'เด็กหญิงกัญญาภัทร  กอทอง', 'ป.4', '$2y$10$1HLW1bzwatMKXW35TaQdpOr5XGZ6bQKV8PDF6HK7nVcMg8ITobNQu', 'student', '2025-06-19 04:13:29'),
(9, '2650', 'เด็กหญิงจิตติมา  บุรมย์', 'ป.4', '$2y$10$cEzgm1CHdBVsLVZkx3h4bOJdWne/xs9uqTmh3IOWZ5yUmb1Eso7FW', 'student', '2025-06-19 04:13:30'),
(10, '2651', 'เด็กหญิงบุณยนุช  วรรณพัฒน์', 'ป.4', '$2y$10$xrvkZnWbddunAqOJDhOqd.4kNT5OMlC.6/KB5TsDeMqZPiZGY5.MO', 'student', '2025-06-19 04:13:30'),
(11, '2652', 'เด็กหญิงอภิสรา  ชูรัตน์', 'ป.4', '$2y$10$swQFzqFiVIAm4s2EHDEhg.lQSwfnSmMsi1P5QFnQgeHbrufCllSR6', 'student', '2025-06-19 04:13:30'),
(12, '2655', 'เด็กหญิงฐิตาภรณ์  ทำนุ', 'ป.4', '$2y$10$sH0iX5s.208Cqs/FDAbFTuXf/95liIe2MFh1wG3kniK1HktCObRP.', 'student', '2025-06-19 04:13:30'),
(13, '2656', 'เด็กหญิงกชกร  เนาวนิตย์', 'ป.4', '$2y$10$s3PvVHv/9ZnvcCWmL0OeaOc.qemcAj.1oaqvLvfrVw98YlcVXQxPW', 'student', '2025-06-19 04:13:30'),
(14, '2657', 'เด็กหญิงกัญญารัตน์  วันซวง', 'ป.4', '$2y$10$RPS/VylDG3YS3q2q/zf9gubCQv3uRouzlU/248K2kyjH.a5F0tDRa', 'student', '2025-06-19 04:13:30'),
(15, '2658', 'เด็กหญิงสิริขวัญ  ศรีมาชัย', 'ป.4', '$2y$10$dS/nsY8SUnAtMzzWnbvLqe9eYUYhTMs8yi6XhlUDwYdfUNfwiNsd.', 'student', '2025-06-19 04:13:30'),
(16, '2659', 'เด็กหญิงพรศินี  เอี่ยมจริง', 'ป.4', '$2y$10$4w5EczvfJXLiNbbQV5mHE.7vQp6ho6kDFd2ZBiOD1I7VvlQqA5OuG', 'student', '2025-06-19 04:13:30'),
(17, '2660', 'เด็กชายศิวกร สุวรรณเพชร', 'ป.4', '$2y$10$I59jZGQY9Txw9OppFzKiIub5GcW6Zabqeq8LQQPnWP8NsLGE.erRO', 'student', '2025-06-19 04:13:30'),
(18, '2712', 'เด็กชายภีรวัฒน์ ศรีสรรณ์', 'ป.4', '$2y$10$G4YLW.vWzGK5c68ry6QVnuZ1QdXxpwMQImZIXnDX95hGRPwXqNqaq', 'student', '2025-06-19 04:13:30');
INSERT INTO `stages` (`id`, `game_id`, `stage_number`, `title`, `instruction`, `content_json`) VALUES
(1, 1, 1, 'เกมลำดับภาพสัตว์ - ด่านที่ 1', 'ลากภาพสัตว์ให้ถูกลำดับ', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_stage_unique` (`user_id`,`stage_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `stages`
--
@ -153,65 +54,20 @@ ALTER TABLE `stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD CONSTRAINT `game_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_logs_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stages`
--
