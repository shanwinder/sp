-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Apr 23, 2026 at 08:53 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learning_game`
--

-- --------------------------------------------------------

--
-- Table structure for table `choices`
--

CREATE TABLE `choices` (
  `id` int NOT NULL,
  `question_id` int NOT NULL,
  `text` varchar(300) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_correct` tinyint DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `choices`
--

INSERT INTO `choices` (`id`, `question_id`, `text`, `image_path`, `is_correct`) VALUES
(1, 1, 'ก. เดาสุ่มคำตอบของปัญหา', NULL, 1),
(2, 1, 'ข. ถามคำตอบจากเพื่อน', NULL, 0),
(3, 1, 'ค. ทำตามความรู้สึกของตนเอง', NULL, 0),
(4, 1, 'ง. คิดหาเหตุผลก่อนตัดสินใจเลือกเส้นทางที่สั้นที่สุด', NULL, 0),
(5, 2, 'ก. เดาสุ่มคำตอบของปัญหา', NULL, 0),
(6, 2, 'ข. ถามคำตอบจากเพื่อน', NULL, 0),
(7, 2, 'ค. ทำตามความรู้สึกของตนเอง', NULL, 0),
(8, 2, 'ง. คิดหาเหตุผลก่อนตัดสินใจเลือกเส้นทางที่สั้นที่สุด', NULL, 1),
(9, 3, 'ก. 🔵', NULL, 0),
(10, 3, 'ข. 🟡', NULL, 1),
(11, 3, 'ค. 🔴', NULL, 0),
(12, 3, 'ง. 🟢', NULL, 0),
(13, 4, 'ก. ฝนอาจจะตก', NULL, 1),
(14, 4, 'ข. แดดต้องออกแน่นอน', NULL, 0),
(15, 4, 'ค. ต้องมีคนทำน้ำหก', NULL, 0),
(16, 4, 'ง. เป็นไปไม่ได้ที่จะรู้สาเหตุ', NULL, 0),
(17, 5, 'ก. 1 -> 2 -> 3 -> 4', NULL, 1),
(18, 5, 'ข. 2 -> 1 -> 4 -> 3', NULL, 0),
(19, 5, 'ค. 4 -> 3 -> 2 -> 1', NULL, 0),
(20, 5, 'ง. 1 -> 3 -> 2 -> 4', NULL, 0),
(21, 6, 'ก. กินข้าวเช้า', NULL, 0),
(22, 6, 'ข. ตื่นนอน', NULL, 1),
(23, 6, 'ค. อาบน้ำ', NULL, 0),
(24, 6, 'ง. แต่งตัว', NULL, 0),
(25, 7, 'ก. ร้องไห้', NULL, 0),
(26, 7, 'ข. ซื้อใหม่', NULL, 0),
(27, 7, 'ค. วางแผนการค้นหาอย่างเป็นระบบ', NULL, 1),
(28, 7, 'ง. บอกให้คนอื่นหาให้', NULL, 0),
(29, 8, 'ก. ชื่อของโปรแกรมคอมพิวเตอร์', NULL, 0),
(30, 8, 'ข. ภาษาที่ใช้คุยกับคอมพิวเตอร์', NULL, 0),
(31, 8, 'ค. ขั้นตอนการแก้ปัญหาอย่างเป็นลำดับ', NULL, 1),
(32, 8, 'ง. อุปกรณ์คอมพิวเตอร์ชนิดหนึ่ง', NULL, 0),
(33, 9, 'ก. ความรู้สึกหิว', NULL, 0),
(34, 9, 'ข. สูตรการทำไข่เจียว', NULL, 1),
(35, 9, 'ค. ท้องฟ้าสีคราม', NULL, 0),
(36, 9, 'ง. เสียงเพลงที่ชอบ', NULL, 0),
(37, 10, 'ก. บีบยาสีฟันลงบนแปรง', NULL, 0),
(38, 10, 'ข. แปรงฟันให้ทั่วทุกซี่', NULL, 0),
(39, 10, 'ค. บ้วนปากด้วยน้ำสะอาด', NULL, 0),
(40, 10, 'ง. เล่นเกมในโทรศัพท์', NULL, 1),
(41, 11, 'ก. เพื่อให้ปัญหายากขึ้น', NULL, 0),
(42, 11, 'ข. เพื่อให้ใช้เวลาแก้ปัญหานานขึ้น', NULL, 0),
(43, 11, 'ค. เพื่อให้แก้ปัญหาได้อย่างเป็นระบบและไม่ผิดพลาด', NULL, 1),
(44, 11, 'ง. เพื่อให้คนอื่นแก้ปัญหาแทนเรา', NULL, 0),
(45, 12, 'ก. คำถาม', NULL, 0),
(46, 12, 'ข. ปริศนา', NULL, 0),
(47, 12, 'ค. อัลกอริทึม', NULL, 1),
(48, 12, 'ง. เรื่องเล่า', NULL, 0),
(49, 13, 'ก. จะได้รับคำชมเชย', NULL, 0),
(50, 13, 'ข. ผลลัพธ์อาจไม่เป็นไปตามที่ต้องการ', NULL, 1),
(51, 13, 'ค. จะแก้ปัญหาได้เร็วขึ้น', NULL, 0),
(52, 13, 'ง. ไม่มีอะไรเกิดขึ้น', NULL, 0),
(53, 14, 'ก. ฉีกซองบะหมี่', NULL, 0),
(54, 14, 'ข. ต้มน้ำให้เดือด', NULL, 1),
(55, 14, 'ค. ใส่เครื่องปรุง', NULL, 0),
(56, 14, 'ง. กินบะหมี่', NULL, 0),
(57, 15, 'ก. รถยนต์', NULL, 0),
(58, 15, 'ข. บ้าน', NULL, 1),
(59, 15, 'ค. ต้นไม้', NULL, 0),
(60, 15, 'ง. ดวงอาทิตย์', NULL, 0),
(61, 16, 'ก. มองซ้าย มองขวา', NULL, 0),
(62, 16, 'ข. เดินข้ามถนน', NULL, 1),
(63, 16, 'ค. รอให้รถหยุด', NULL, 0),
(64, 16, 'ง. เดินไปที่ทางม้าลาย', NULL, 0),
(65, 17, 'ก. ทำให้คนอื่นอ่านไม่เข้าใจ', NULL, 0),
(66, 17, 'ข. ทำให้ทุกคนเข้าใจขั้นตอนตรงกัน', NULL, 1),
(67, 17, 'ค. ทำให้ดูซับซ้อนและน่าสับสน', NULL, 0),
(68, 17, 'ง. ทำให้ต้องใช้จินตนาการสูง', NULL, 0),
(69, 18, 'ก. สลับระหว่าง \"ล้างด้วยน้ำยาล้างจาน\" กับ \"ล้างด้วยน้ำสะอาด\"', NULL, 0),
(70, 18, 'ข. สลับระหว่าง \"เก็บจาน\" กับ \"ล้างจาน\"', NULL, 0),
(71, 18, 'ค. สลับระหว่าง \"เช็ดจานให้แห้ง\" กับ \"นำจานไปเก็บ\"', NULL, 0),
(72, 18, 'ง. สลับระหว่าง \"กวาดเศษอาหารทิ้ง\" กับ \"ล้างด้วยน้ำยาล้างจาน\"', NULL, 1),
(73, 19, 'ก. รดน้ำ -> ใส่ปุ๋ย -> ขุดหลุม -> ใส่เมล็ด', NULL, 0),
(74, 19, 'ข. ขุดหลุม -> ใส่เมล็ด -> กลบดิน -> รดน้ำ', NULL, 1),
(75, 19, 'ค. ใส่เมล็ด -> รดน้ำ -> ขุดหลุม -> กลบดิน', NULL, 0),
(76, 19, 'ง. กลบดิน -> ใส่ปุ๋ย -> รดน้ำ -> ใส่เมล็ด', NULL, 0),
(77, 20, 'ก. 1 ครั้ง', NULL, 0),
(78, 20, 'ข. 2 ครั้ง', NULL, 0),
(79, 20, 'ค. 3 ครั้ง', NULL, 1),
(80, 20, 'ง. 4 ครั้ง', NULL, 0),
(81, 21, 'ก. กางร่ม', NULL, 0),
(82, 21, 'ข. ไม่ต้องทำอะไร', NULL, 1),
(83, 21, 'ค. ใส่เสื้อกันฝน', NULL, 0),
(84, 21, 'ง. วิ่งตากฝน', NULL, 0),
(85, 22, 'ก. การทำงานเพียงครั้งเดียว', NULL, 0),
(86, 22, 'ข. การทำงานเดิมๆ หลายครั้ง', NULL, 1),
(87, 22, 'ค. การหยุดการทำงาน', NULL, 0),
(88, 22, 'ง. การเลือกทำอย่างใดอย่างหนึ่ง', NULL, 0),
(89, 23, 'ก. แบบวนซ้ำ', NULL, 0),
(90, 23, 'ข. แบบตามลำดับ', NULL, 0),
(91, 23, 'ค. แบบมีเงื่อนไข', NULL, 1),
(92, 23, 'ง. แบบสุ่ม', NULL, 0),
(93, 24, 'ก. เก่งมาก', NULL, 1),
(94, 24, 'ข. พยายามอีกนิด', NULL, 0),
(95, 24, 'ค. ไม่แสดงผลอะไรเลย', NULL, 0),
(96, 24, 'ง. แสดงผลทั้งสองอย่าง', NULL, 0),
(97, 25, 'ก. เป็นภาษาโปรแกรมที่คอมพิวเตอร์เข้าใจได้ทันที', NULL, 0),
(98, 25, 'ข. เป็นร่างหรือแผนผังการเขียนโปรแกรมที่มนุษย์อ่านเข้าใจง่าย', NULL, 1),
(99, 25, 'ค. เป็นโค้ดที่ทำงานผิดพลาดเสมอ', NULL, 0),
(100, 25, 'ง. เป็นโค้ดที่ใช้สำหรับวาดรูปเท่านั้น', NULL, 0),
(101, 26, 'ก. การตัดสินใจ', NULL, 0),
(102, 26, 'ข. การทำงาน หรือ กระบวนการ', NULL, 0),
(103, 26, 'ค. จุดเริ่มต้น หรือ สิ้นสุด', NULL, 1),
(104, 26, 'ง. การรับข้อมูล', NULL, 0),
(105, 27, 'ก. การตัดสินใจ หรือ เงื่อนไข', NULL, 1),
(106, 27, 'ข. การทำงาน หรือ กระบวนการ', NULL, 0),
(107, 27, 'ค. จุดเริ่มต้น หรือ สิ้นสุด', NULL, 0),
(108, 27, 'ง. ทิศทางการทำงาน', NULL, 0),
(109, 28, 'ก. 1 เส้นเสมอ', NULL, 0),
(110, 28, 'ข. 2 เส้น (เช่น จริง/เท็จ หรือ ใช่/ไม่ใช่)', NULL, 1),
(111, 28, 'ค. 3 เส้นเสมอ', NULL, 0),
(112, 28, 'ง. ไม่มีเส้นออก', NULL, 0),
(113, 29, 'ก. ตกแต่งให้สวยงาม', NULL, 0),
(114, 29, 'ข. บอกทิศทางการทำงานของขั้นตอน', NULL, 1),
(115, 29, 'ค. แบ่งแยกพื้นที่', NULL, 0),
(116, 29, 'ง. ไม่มีประโยชน์', NULL, 0),
(117, 30, 'ก. เริ่มต้น และ จบ', NULL, 0),
(118, 30, 'ข. ต้มน้ำ และ ใส่บะหมี่', NULL, 1),
(119, 30, 'ค. ต้มน้ำ เท่านั้น', NULL, 0),
(120, 30, 'ง. ไม่มีกระบวนการ', NULL, 0),
(121, 31, 'ก. ทำให้ปัญหาดูซับซ้อนขึ้น', NULL, 0),
(122, 31, 'ข. ทำให้เห็นลำดับขั้นตอนการทำงานเป็นภาพ เข้าใจง่าย', NULL, 1),
(123, 31, 'ค. ทำให้เขียนโปรแกรมได้โดยไม่ต้องคิด', NULL, 0),
(124, 31, 'ง. ทำให้ใช้กระดาษเยอะขึ้น', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `code`, `title`, `description`, `created_at`) VALUES
(1, 'Logic', 'แบบฝึกทักษะเหตุผลเชิงตรรกะ', NULL, '2025-09-08 17:00:00'),
(2, 'Algorithm', 'แบบฝึกทักษะอัลกอริทึม', NULL, '2025-09-08 17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `game_logs`
--

CREATE TABLE `game_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `stage_id` int NOT NULL,
  `action` enum('start','submit','hint','pass','fail') NOT NULL,
  `detail` text,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `game_logs`
--

INSERT INTO `game_logs` (`id`, `user_id`, `stage_id`, `action`, `detail`, `logged_at`) VALUES
(1, 18, 1, 'pass', '{\"stars_earned\":2,\"duration_seconds\":18,\"attempts\":0}', '2025-09-08 17:02:22'),
(2, 18, 1, 'pass', '{\"stars_earned\":3,\"duration_seconds\":6,\"attempts\":0}', '2025-09-08 18:13:08'),
(3, 18, 2, 'pass', '{\"stars_earned\":3,\"duration_seconds\":5,\"attempts\":0}', '2025-09-08 18:13:17'),
(4, 18, 3, 'pass', '{\"stars_earned\":3,\"duration_seconds\":7,\"attempts\":0}', '2025-09-08 18:13:27'),
(5, 18, 4, 'pass', '{\"stars_earned\":3,\"duration_seconds\":35,\"attempts\":0}', '2025-09-08 18:14:08'),
(6, 18, 5, 'pass', '{\"stars_earned\":2,\"duration_seconds\":87,\"attempts\":3}', '2025-09-08 18:15:39'),
(7, 18, 1, 'pass', '{\"stars_earned\":2,\"duration_seconds\":42,\"attempts\":1}', '2026-01-11 15:39:36');

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `stage_id` int NOT NULL,
  `score` int DEFAULT '0',
  `duration_seconds` int DEFAULT '0',
  `attempts` int DEFAULT '1',
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `user_id`, `stage_id`, `score`, `duration_seconds`, `attempts`, `completed_at`) VALUES
(4, 18, 1, 3, 42, 2, '2026-01-11 15:39:36'),
(6, 18, 2, 3, 5, 0, '2025-09-08 18:13:17'),
(7, 18, 3, 3, 7, 0, '2025-09-08 18:13:27'),
(8, 18, 4, 3, 35, 0, '2025-09-08 18:14:08'),
(9, 18, 5, 2, 87, 3, '2025-09-08 18:15:39');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `text` varchar(500) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `difficulty` tinyint DEFAULT '1',
  `active` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `text`, `image_path`, `unit`, `difficulty`, `active`) VALUES
(1, 'ข้อใดคือการแก้ปัญหาโดยใช้เหตุผลเชิงตรรกะ', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(2, 'ข้อใดคือการแก้ปัญหาโดยใช้เหตุผลเชิงตรรกะ', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(3, 'พิจารณาแบบรูปต่อไปนี้: 🔵 🟡 🔴 🔵 🟡 🔴 🔵 ? รูปถัดไปในช่องว่างคือรูปใด', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(4, 'ถ้าฝนตก แล้วพื้นจะเปียก วันนี้พื้นเปียก แสดงว่าเกิดอะไรขึ้น', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(5, 'จากภาพ ลำดับเหตุการณ์ใดถูกต้อง (ภาพ: 1.เมล็ดพืช -> 2.ต้นอ่อน -> 3.ต้นไม้มีดอก -> 4.ต้นไม้มีผล)', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(6, 'หากต้องการไปโรงเรียนให้ทันเวลา ควรทำสิ่งใดเป็นอันดับแรกสุด', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(7, 'ถ้าต้องการหาของที่หายไปในห้อง สิ่งแรกที่ควรทำคืออะไร', NULL, 'เหตุผลเชิงตรรกะ', 2, 1),
(8, '\"อัลกอริทึม\" หมายถึงอะไร', NULL, 'อัลกอริทึม', 2, 1),
(9, 'ข้อใดคือตัวอย่างของอัลกอริทึมในชีวิตประจำวัน', NULL, 'อัลกอริทึม', 2, 1),
(10, 'การกระทำใด ไม่จัดว่า เป็นส่วนหนึ่งของอัลกอริทึม \"การแปรงฟัน\"', NULL, 'อัลกอริทึม', 2, 1),
(11, 'ทำไมเราต้องคิดอัลกอริทึมก่อนลงมือแก้ปัญหา', NULL, 'อัลกอริทึม', 2, 1),
(12, '\"เริ่มต้น -> เดินหน้า 3 ก้าว -> เลี้ยวขวา -> เดินหน้า 2 ก้าว -> หยุด\" ข้อความนี้คืออะไร', NULL, 'อัลกอริทึม', 2, 1),
(13, 'หากทำตามอัลกอริทึมผิดขั้นตอน จะเกิดอะไรขึ้น', NULL, 'อัลกอริทึม', 2, 1),
(14, 'ข้อใดคือขั้นตอนแรกของ \"อัลกอริทึมการต้มบะหมี่กึ่งสำเร็จรูป\"', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(15, '\"1. วาดรูปวงกลม 2. วาดรูปสามเหลี่ยมทับบนวงกลม 3. เติมหน้าต่าง\" เป็นอัลกอริทึมการวาดรูปอะไร', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(16, 'ถ้าต้องการเขียนอัลกอริทึม \"การข้ามถนนตรงทางม้าลาย\" ข้อใดควรอยู่เป็นลำดับสุดท้าย', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(17, 'การแสดงอัลกอริทึมด้วยข้อความมีประโยชน์อย่างไร', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(18, 'หากต้องการสลับลำดับขั้นตอนใน \"อัลกอริทึมการล้างจาน\" ข้อใดจะเกิดปัญหามากที่สุด', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(19, 'ข้อใดคือการเรียงลำดับ \"อัลกอริทึมการปลูกต้นไม้\" ที่ถูกต้อง', NULL, 'การแสดงอัลกอริทึมด้วยข้อความ', 2, 1),
(20, 'จากรหัสจำลอง : เริ่มต้น ทำซ้ำ 3 รอบ พูดว่า “สวัสดี\" จบ จะมีการพูดคำว่า \"สวัสดี\" ทั้งหมดกี่ครั้ง', NULL, 'รหัสจำลอง', 2, 1),
(21, 'จากรหัสจำลอง เริ่มต้น ถ้า (วันนี้ฝนตก) แล้ว ให้กางร่ม จบ ถ้าหากวันนี้แดดออก จะต้องทำอะไร', NULL, 'รหัสจำลอง', 2, 1),
(22, 'คำว่า \"ทำซ้ำ\" ในรหัสจำลอง มีความหมายตรงกับข้อใด', NULL, 'รหัสจำลอง', 2, 1),
(23, '\"ถ้า ... แล้ว ...\" ในรหัสจำลอง เป็นการทำงานแบบใด', NULL, 'รหัสจำลอง', 2, 1),
(24, 'จากรหัสจำลอง เริ่มต้น คะแนน = 85 ถ้า (คะแนน > 80) แล้ว แสดงผล “เก่งมาก\" มิฉะนั้น แสดงผล “พยายามอีกนิด\" จบ ผลลัพธ์คืออะไร', NULL, 'รหัสจำลอง', 2, 1),
(25, 'รหัสจำลองมีประโยชน์อย่างไร', NULL, 'รหัสจำลอง', 2, 1),
(26, 'สัญลักษณ์รูปวงรี (ทรงแคปซูล) ในผังงาน หมายถึงอะไร', NULL, 'ผังงาน', 2, 1),
(27, 'สัญลักษณ์รูปสี่เหลี่ยมขนมเปียกปูน (ข้าวหลามตัด) ในผังงาน หมายถึงอะไร', NULL, 'ผังงาน', 2, 1),
(28, 'ถ้าในผังงานมีสัญลักษณ์สี่เหลี่ยมขนมเปียกปูนที่เขียนว่า \"หิวหรือไม่?\" จะมีเส้นออกจากสัญลักษณ์นี้กี่เส้น', NULL, 'ผังงาน', 2, 1),
(29, 'ลูกศรในผังงาน มีไว้เพื่ออะไร', NULL, 'ผังงาน', 2, 1),
(30, 'จากผังงานง่ายๆ: เริ่มต้น -> ต้มน้ำ -> ใส่บะหมี่ -> จบ ขั้นตอนใดคือ \"กระบวนการ\" (Process)', NULL, 'ผังงาน', 2, 1),
(31, 'ข้อใดคือประโยชน์ที่สำคัญที่สุดของการใช้ผังงาน', NULL, 'ผังงาน', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `stages`
--

CREATE TABLE `stages` (
  `id` int NOT NULL,
  `game_id` int NOT NULL,
  `stage_number` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `instruction` text,
  `content_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stages`
--

INSERT INTO `stages` (`id`, `game_id`, `stage_number`, `title`, `instruction`, `content_json`) VALUES
(1, 1, 1, 'ด่านที่ 1', NULL, NULL),
(2, 1, 2, 'ด่านที่ 2', NULL, NULL),
(3, 1, 3, 'ด่านที่ 3', NULL, NULL),
(4, 1, 4, 'ด่านที่ 4', NULL, NULL),
(5, 1, 5, 'ด่านที่ 5', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_feedback`
--

CREATE TABLE `student_feedback` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `game_id` int DEFAULT NULL,
  `stage_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_answers`
--

CREATE TABLE `test_answers` (
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `choice_id` int NOT NULL,
  `is_correct` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `test_answers`
--

INSERT INTO `test_answers` (`attempt_id`, `question_id`, `choice_id`, `is_correct`) VALUES
(1, 1, 1, 1),
(1, 2, 6, 0),
(1, 3, 12, 0),
(1, 4, 16, 0),
(1, 5, 20, 0),
(1, 6, 21, 0),
(1, 7, 28, 0),
(1, 8, 29, 0),
(1, 9, 33, 0),
(1, 10, 39, 0),
(1, 11, 42, 0),
(1, 12, 48, 0),
(1, 13, 50, 1),
(1, 14, 56, 0),
(1, 15, 57, 0),
(1, 16, 64, 0),
(1, 17, 65, 0),
(1, 19, 75, 0),
(1, 20, 77, 0),
(1, 21, 83, 0),
(1, 22, 86, 1),
(1, 23, 90, 0),
(1, 24, 95, 0),
(1, 25, 99, 0),
(1, 26, 104, 0),
(1, 27, 108, 0),
(1, 28, 112, 0),
(1, 29, 116, 0),
(1, 30, 118, 1),
(1, 31, 122, 1);

-- --------------------------------------------------------

--
-- Table structure for table `test_attempts`
--

CREATE TABLE `test_attempts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `test_type` enum('pre','post') NOT NULL,
  `score` int NOT NULL,
  `max_score` int NOT NULL,
  `started_at` datetime NOT NULL,
  `submitted_at` datetime NOT NULL,
  `duration_seconds` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `test_attempts`
--

INSERT INTO `test_attempts` (`id`, `user_id`, `test_type`, `score`, `max_score`, `started_at`, `submitted_at`, `duration_seconds`) VALUES
(1, 18, 'pre', 5, 30, '2025-09-07 12:48:47', '2025-09-07 13:55:24', 3997);

-- --------------------------------------------------------

--
-- Table structure for table `titles`
--

CREATE TABLE `titles` (
  `id` int NOT NULL,
  `title_name` varchar(100) NOT NULL,
  `min_stars_required` int NOT NULL,
  `css_class` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `titles`
--

INSERT INTO `titles` (`id`, `title_name`, `min_stars_required`, `css_class`) VALUES
(1, 'นักคิดเริ่มต้น', 1, 'achievement-level-1'),
(2, 'นักคิดตรรกะ', 15, 'achievement-level-2'),
(3, 'ผู้เชี่ยวชาญเหตุผล', 30, 'achievement-level-3'),
(4, 'นักสร้างคำสั่ง', 45, 'achievement-level-4'),
(5, 'ผู้ควบคุมหุ่นยนต์', 55, 'achievement-level-5'),
(6, 'ยอดนักวางแผน', 60, 'achievement-level-6'),
(7, 'นักเขียนโค้ดจิ๋ว', 75, 'achievement-level-7'),
(8, 'นักแก้ปัญหาด้วยภาษา', 85, 'achievement-level-8'),
(9, 'ปรมาจารย์รหัสจำลอง', 90, 'achievement-level-9'),
(10, 'นักออกแบบผังความคิด', 105, 'achievement-level-10'),
(11, 'จอมวิเคราะห์ผังงาน', 115, 'achievement-level-11'),
(12, 'จอมวางแผนผังงาน', 120, 'achievement-level-12'),
(13, 'โค้ดดิ้งฮีโร่', 135, 'achievement-level-13'),
(14, 'สุดยอดนักประดิษฐ์ดิจิทัล', 145, 'achievement-level-14'),
(15, 'ครูคอมพิวเตอร์น้อย', 150, 'achievement-level-15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_level` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','admin') DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `name`, `class_level`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'ณัฐดนัย สุวรรณไตรย์', NULL, '$2y$10$8brwLbBVkwKC4K4BhNS1DOwKJRzWDaQGb2ApGYe7TUOVS0g.DaODW', 'admin', '2025-09-01 19:03:20'),
(2, '2644', 'เด็กชายปิยะวิทย์  บุญมาตร์', 'ป.4', '$2y$10$lDazdshQ7ja3WxD2Bqyyi.jFGEKZfL5rLPPbMjNiJeJPw6NJszeaa', 'student', '2025-09-01 19:04:37'),
(3, '2645', 'เด็กชายหนึ่งธันวา  ตาทิพย์', 'ป.4', '$2y$10$u3CO7EatIvcBghKqURZkKekP5cec9A8fuqsWq0ij0YfTvZzF8ESCy', 'student', '2025-09-01 19:04:37'),
(4, '2646', 'เด็กชายชุติพนธ์  ฉิมพลี', 'ป.4', '$2y$10$LXZZq2uIKaeJuUUssHdPKee.BdRP1cLebg3UOsjmoeo38/ltzKBp2', 'student', '2025-09-01 19:04:38'),
(5, '2647', 'เด็กชายวิทวัส  เติมศิลป์', 'ป.4', '$2y$10$uo1gbwPQJ02WlwBkXnLftuaag7zLxBctm9jVgkAh7uIjvUtCKmAW.', 'student', '2025-09-01 19:04:38'),
(6, '2648', 'เด็กชายวีรศรุต  วงศ์สมัคร', 'ป.4', '$2y$10$p0lXuiGEJewICxYhBDXnIeJfQAY2OMek5tCZU6vE7asRGQCtN8Kfq', 'student', '2025-09-01 19:04:38'),
(7, '2649', 'เด็กหญิงกัญญาภัทร  กอทอง', 'ป.4', '$2y$10$1TbyCiR4XrG1ttPQ7.wu7.vGm0IhNAbLQ56ol2Z2.80SqZM.V7Z0e', 'student', '2025-09-01 19:04:38'),
(8, '2650', 'เด็กหญิงจิตติมา  บุรมย์', 'ป.4', '$2y$10$NaV1tSDQX0hPWkFmFaWyV.6y9RzFi1zLsDuo9Hysh/YS4lwYb7vb.', 'student', '2025-09-01 19:04:38'),
(9, '2651', 'เด็กหญิงบุณยนุช  วรรณพัฒน์', 'ป.4', '$2y$10$px9ljFGsJbaFBDgyBDFKfe7d.WZPE6EQ9JKV/l3Sa6O1TIgeFJMJe', 'student', '2025-09-01 19:04:38'),
(10, '2652', 'เด็กหญิงอภิสรา  ชูรัตน์', 'ป.4', '$2y$10$cdPTS7BFCQxybwqDz5TY/.FuPNFFxHspmT.of2rkJpbogoVjFBpzW', 'student', '2025-09-01 19:04:39'),
(11, '2655', 'เด็กหญิงฐิตาภรณ์  ทำนุ', 'ป.4', '$2y$10$OzrcNE1bz14DKffMHBbDhe0Hah6jFAfbEwHHLdYdHXDe8WaAUE0.y', 'student', '2025-09-01 19:04:39'),
(12, '2656', 'เด็กหญิงกชกร  เนาวนิตย์', 'ป.4', '$2y$10$2mx60dKGAJlE7q3uTwPhvOcrrIJg5yDRx/f6WybeqhuCQlR.tkfXy', 'student', '2025-09-01 19:04:39'),
(13, '2657', 'เด็กหญิงกัญญารัตน์  วันซวง', 'ป.4', '$2y$10$M0PNVEdY1gu1/BEFIuQLqe9dySEOT9T8TFN8WPuGfYLVj3ewDMm.K', 'student', '2025-09-01 19:04:39'),
(14, '2658', 'เด็กหญิงสิริขวัญ  ศรีมาชัย', 'ป.4', '$2y$10$iZ28wenjRwdhUQphQkS23OfWOkeoWwg0pDO9aO5sPVNJmMnvycvay', 'student', '2025-09-01 19:04:39'),
(15, '2659', 'เด็กหญิงพรศินี  เอี่ยมจริง', 'ป.4', '$2y$10$42PYNoNgNscBEBG9WUGNreMEyA1Mv/tm79QKJwY0tMADncVkTXwHS', 'student', '2025-09-01 19:04:39'),
(16, '2660', 'เด็กชายศิวกร สุวรรณเพชร', 'ป.4', '$2y$10$lcjNtsoZDZ3CfCWMcfJ9tuMfnRbGvTpp09ZEZBx48lSJBFT8VjuDO', 'student', '2025-09-01 19:04:40'),
(17, '2712', 'เด็กชายภีรวัฒน์ ศรีสรรณ์', 'ป.4', '$2y$10$2kdBVihHP2dWlnnPJNnrjObZYYLIkgbikNfQvMk8tz1F0XPvU7.4a', 'student', '2025-09-01 19:04:40'),
(18, 'ทดสอบ', 'เด็กชายทดสอบ ลองดู', '', '$2y$10$384Ig/.0IIQraXbXf/G9Zu3h/4eBeE3wv3pXrP1kqcPwwzB.dKxje', 'student', '2025-09-01 19:06:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `choices`
--
ALTER TABLE `choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

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
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stages`
--
ALTER TABLE `stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indexes for table `student_feedback`
--
ALTER TABLE `student_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `test_answers`
--
ALTER TABLE `test_answers`
  ADD PRIMARY KEY (`attempt_id`,`question_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `choice_id` (`choice_id`);

--
-- Indexes for table `test_attempts`
--
ALTER TABLE `test_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`,`test_type`);

--
-- Indexes for table `titles`
--
ALTER TABLE `titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title_name` (`title_name`),
  ADD UNIQUE KEY `min_stars_required` (`min_stars_required`);

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
-- AUTO_INCREMENT for table `choices`
--
ALTER TABLE `choices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_feedback`
--
ALTER TABLE `student_feedback`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `test_attempts`
--
ALTER TABLE `test_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `titles`
--
ALTER TABLE `titles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `choices`
--
ALTER TABLE `choices`
  ADD CONSTRAINT `choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

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
ALTER TABLE `stages`
  ADD CONSTRAINT `stages_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_feedback`
--
ALTER TABLE `student_feedback`
  ADD CONSTRAINT `student_feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `test_answers`
--
ALTER TABLE `test_answers`
  ADD CONSTRAINT `test_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `test_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `test_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `test_answers_ibfk_3` FOREIGN KEY (`choice_id`) REFERENCES `choices` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
