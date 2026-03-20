-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: host.docker.internal    Database: asset_management
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `type` enum('consumable','borrowable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'consumable',
  `quantity` int NOT NULL DEFAULT '0',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ชิ้น',
  `price_per_unit` decimal(12,2) DEFAULT '0.00',
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_quantity` int DEFAULT '0',
  `status` enum('active','damaged','repairing','disposed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_code` (`asset_code`),
  UNIQUE KEY `asset_code_2` (`asset_code`),
  UNIQUE KEY `asset_code_3` (`asset_code`),
  UNIQUE KEY `asset_code_4` (`asset_code`),
  UNIQUE KEY `asset_code_5` (`asset_code`),
  UNIQUE KEY `asset_code_6` (`asset_code`),
  UNIQUE KEY `asset_code_7` (`asset_code`),
  UNIQUE KEY `asset_code_8` (`asset_code`),
  UNIQUE KEY `asset_code_9` (`asset_code`),
  UNIQUE KEY `asset_code_10` (`asset_code`),
  UNIQUE KEY `asset_code_11` (`asset_code`),
  UNIQUE KEY `asset_code_12` (`asset_code`),
  UNIQUE KEY `asset_code_13` (`asset_code`),
  UNIQUE KEY `asset_code_14` (`asset_code`),
  UNIQUE KEY `asset_code_15` (`asset_code`),
  UNIQUE KEY `asset_code_16` (`asset_code`),
  UNIQUE KEY `asset_code_17` (`asset_code`),
  UNIQUE KEY `asset_code_18` (`asset_code`),
  UNIQUE KEY `asset_code_19` (`asset_code`),
  UNIQUE KEY `asset_code_20` (`asset_code`),
  UNIQUE KEY `asset_code_21` (`asset_code`),
  UNIQUE KEY `asset_code_22` (`asset_code`),
  UNIQUE KEY `asset_code_23` (`asset_code`),
  KEY `category_id` (`category_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `assets_ibfk_41` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assets_ibfk_42` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'OFC-001','กระดาษ A4 80 แกรม','กระดาษ A4',1,NULL,'consumable',200,'รีม',120.00,'ห้องพัสดุ',50,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(2,'OFC-002','ปากกาลูกลื่น สีน้ำเงิน','ปากกาลูกลื่น',1,NULL,'consumable',500,'ด้าม',8.00,'ห้องพัสดุ',100,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(3,'OFC-003','แฟ้มเอกสาร A4','แฟ้มเอกสาร',1,NULL,'consumable',150,'แฟ้ม',25.00,'ห้องพัสดุ',30,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(4,'OFC-004','หมึกเครื่องพิมพ์ HP 680 สีดำ','ตลับหมึก',1,NULL,'consumable',30,'ตลับ',350.00,'ห้องพัสดุ',10,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(5,'OFC-005','สมุดบันทึก A5','สมุดบันทึก',1,NULL,'consumable',100,'เล่ม',45.00,'ห้องพัสดุ',20,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(6,'COM-001','โน้ตบุ๊ค Lenovo ThinkPad','โน้ตบุ๊ค',2,NULL,'borrowable',10,'เครื่อง',22000.00,'ห้อง IT',2,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(7,'COM-002','โปรเจคเตอร์ Epson EB-X51','โปรเจคเตอร์',2,NULL,'borrowable',5,'เครื่อง',15000.00,'ห้อง IT',1,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(8,'COM-003','เมาส์ไร้สาย Logitech','เมาส์',2,NULL,'consumable',40,'ตัว',590.00,'ห้อง IT',5,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(9,'COM-004','คีย์บอร์ด USB Logitech','คีย์บอร์ด',2,NULL,'consumable',35,'ตัว',390.00,'ห้อง IT',5,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(10,'COM-005','USB Flash Drive 32GB','แฟลชไดรฟ์',2,NULL,'consumable',50,'อัน',150.00,'ห้อง IT',10,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(11,'FUR-001','โต๊ะพับอเนกประสงค์','โต๊ะพับ',3,3,'borrowable',20,'ตัว',1200.00,'โกดัง',5,'active','2026-03-19 19:08:36','2026-03-19 19:27:34'),(12,'FUR-002','เก้าอี้พับ','เก้าอี้',3,NULL,'borrowable',100,'ตัว',450.00,'โกดัง',20,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(13,'FUR-003','ตู้เอกสาร 4 ลิ้นชัก','ตู้เอกสาร',3,NULL,'borrowable',8,'ตู้',3500.00,'โกดัง',2,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(14,'FUR-004','ไวท์บอร์ดขาตั้ง','ไวท์บอร์ด',3,NULL,'borrowable',6,'ตัว',2800.00,'โกดัง',2,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(15,'SPT-001','ลูกฟุตบอล Molten','ลูกฟุตบอล',4,NULL,'borrowable',15,'ลูก',890.00,'ห้องกีฬา',3,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(16,'SPT-002','ลูกบาสเกตบอล Spalding','ลูกบาส',4,NULL,'borrowable',10,'ลูก',1200.00,'ห้องกีฬา',2,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(17,'SPT-003','เสื้อกีฬาทีม (คละสี)','เสื้อกีฬา',4,NULL,'consumable',200,'ตัว',180.00,'ห้องกีฬา',30,'active','2026-03-19 19:08:36','2026-03-19 19:08:36'),(18,'OTH-001','เครื่องเสียงพกพา JBL','เครื่องเสียง',5,3,'borrowable',3,'ชุด',12000.00,'ห้องโสตฯ',1,'active','2026-03-19 19:08:36','2026-03-19 19:27:49'),(19,'OTH-002','กล้องถ่ายรูป Canon EOS M50','กล้อง',5,3,'borrowable',2,'ตัว',25000.00,'ห้องโสตฯ',1,'active','2026-03-19 19:08:36','2026-03-19 19:27:44'),(20,'OTH-003','ป้ายไวนิลกิจกรรม','ป้ายไวนิล',5,3,'consumable',25,'ผืน',500.00,'โกดัง',5,'active','2026-03-19 19:08:36','2026-03-19 19:27:38'),(21,'REG-SPT-001','ทดสอบ1','',4,1,'consumable',10,'ชิ้น',200.00,'โกดังพัสดุ อาคาร 3',2,'active','2026-03-20 10:10:50','2026-03-20 10:10:50');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrows`
--

DROP TABLE IF EXISTS `borrows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `user_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `purpose` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `borrow_date` datetime DEFAULT NULL,
  `expected_return_date` datetime DEFAULT NULL,
  `actual_return_date` datetime DEFAULT NULL,
  `status` enum('pending','borrowing','returned','overdue','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `return_condition` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `borrows_ibfk_58` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `borrows_ibfk_59` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `borrows_ibfk_60` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrows`
--

LOCK TABLES `borrows` WRITE;
/*!40000 ALTER TABLE `borrows` DISABLE KEYS */;
INSERT INTO `borrows` VALUES (1,19,4,1,'','2026-03-20 11:30:49','2026-03-23 07:00:00',NULL,'pending',NULL,NULL,NULL,'2026-03-20 11:30:49','2026-03-20 11:30:49');
/*!40000 ALTER TABLE `borrows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_prefix` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `department_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `sku_prefix` (`sku_prefix`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `sku_prefix_2` (`sku_prefix`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `sku_prefix_3` (`sku_prefix`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `sku_prefix_4` (`sku_prefix`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `sku_prefix_5` (`sku_prefix`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `sku_prefix_6` (`sku_prefix`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `sku_prefix_7` (`sku_prefix`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `sku_prefix_8` (`sku_prefix`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `sku_prefix_9` (`sku_prefix`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `sku_prefix_10` (`sku_prefix`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `sku_prefix_11` (`sku_prefix`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `sku_prefix_12` (`sku_prefix`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `sku_prefix_13` (`sku_prefix`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `sku_prefix_14` (`sku_prefix`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `sku_prefix_15` (`sku_prefix`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `sku_prefix_16` (`sku_prefix`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `sku_prefix_17` (`sku_prefix`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `sku_prefix_18` (`sku_prefix`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `sku_prefix_19` (`sku_prefix`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `sku_prefix_20` (`sku_prefix`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `sku_prefix_21` (`sku_prefix`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `sku_prefix_22` (`sku_prefix`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `sku_prefix_23` (`sku_prefix`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'อุปกรณ์สำนักงาน','OFC','เครื่องเขียน กระดาษ หมึกพิมพ์ ฯลฯ',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36'),(2,'อุปกรณ์คอมพิวเตอร์','COM','คอมพิวเตอร์ จอภาพ เครื่องพิมพ์ ฯลฯ',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36'),(3,'เฟอร์นิเจอร์','FUR','โต๊ะ เก้าอี้ ตู้เก็บของ ฯลฯ',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36'),(4,'อุปกรณ์กีฬา','SPT','ลูกบอล ตาข่าย อุปกรณ์กีฬาต่างๆ',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36'),(5,'อื่นๆ','OTH','สิ่งของอื่นๆ',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'สำนักทะเบียน','ประกอบด้วยแผนก\r\n- แผนกตรวจสอบและรับรองผลการศึกษา\r\n- แผนกทะเบียน','2026-03-19 19:20:42','2026-03-20 10:09:07',NULL),(2,'ศูนย์พัฒนานักศึกษาแบบองค์รวม','ประกอบด้วยแผนก \r\n- แผนกพัฒนากิจกรรมนักศึกษาและส่งเสริมสุขภาวะ\r\n- แผนกพัฒนาทาเล้นท์ ','2026-03-19 19:21:47','2026-03-20 10:08:59',NULL),(3,'ศูนย์บริการนักศึกษา','ประกอบด้วยแผนก \r\n- แผนกทุนการศึกษา\r\n- แผนกความปลอดภัยและวินัยนักศึกษา\r\n- หน่วยบริการเบ็ดเสร็จ\r\n- คอนแทคเซ็นเตอร์','2026-03-19 19:22:31','2026-03-20 10:08:47',NULL),(4,'เวิร์คอินเทค','ประกอบด้วยแผนก \r\n- แผนกเวิร์คอินเทค','2026-03-19 19:22:45','2026-03-20 10:09:31',NULL);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('superadmin','admin','staff') COLLATE utf8mb4_unicode_ci DEFAULT 'staff',
  `department_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$rgwrApyIvRP9MCJ/BcXPneAMTDbiBDc/cj1Qt8OVIk4vjb6IGi2fG','ผู้ดูแลระบบ','admin@example.com','superadmin',NULL,'2026-03-19 19:08:36','2026-03-19 19:08:36',NULL),(3,'sscadmin','$2a$10$hV6TfxE3lL/2E6BpTikaX.hMmywg7nQVNiTe/7ApjS98bNQQmZv9m','admin ศูนย์บริการนักศึกษา','test01@bu.ac.th','admin',3,'2026-03-19 19:24:04','2026-03-20 11:52:35',NULL),(4,'outlet007','$2a$10$BSqwnyATG/rhgyDQOjBakuylBzLGz9wQa6cJAPgfjvQaGRK3ZbTQW','อารักษ์ ยาจิตต์','arluck.y@bu.ac.th','superadmin',NULL,'2026-03-19 19:24:32','2026-03-19 19:24:43',NULL),(5,'sscuser','$2a$10$iMqbhoHFm9KX4gwqV3CiPuCFOY4wikBUwZh.R/wHqIoN.t/EntbXu','เจ้าหน้าที่ ศูนย์บริการนักศึกษา','','staff',3,'2026-03-20 11:52:07','2026-03-20 11:52:07',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawals`
--

DROP TABLE IF EXISTS `withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `user_id` int NOT NULL,
  `quantity` int NOT NULL,
  `purpose` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `withdrawal_date` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rejection_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `withdrawals_ibfk_58` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `withdrawals_ibfk_59` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `withdrawals_ibfk_60` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawals`
--

LOCK TABLES `withdrawals` WRITE;
/*!40000 ALTER TABLE `withdrawals` DISABLE KEYS */;
INSERT INTO `withdrawals` VALUES (1,10,4,1,'','2026-03-20 11:29:27','pending',NULL,NULL,'2026-03-20 11:29:27','2026-03-20 11:29:27'),(2,20,3,1,'','2026-03-20 11:35:05','pending',NULL,NULL,'2026-03-20 11:35:05','2026-03-20 11:35:05'),(3,20,5,10,'','2026-03-20 11:53:40','pending',NULL,NULL,'2026-03-20 11:53:40','2026-03-20 11:53:40');
/*!40000 ALTER TABLE `withdrawals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20 11:24:34
