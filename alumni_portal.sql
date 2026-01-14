-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: alumni_portal
-- ------------------------------------------------------
-- Server version	8.0.35

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
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `donation_type` varchar(50) DEFAULT NULL,
  `message` text,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `donation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `idx_donations_donor` (`donor_id`),
  KEY `idx_donations_status` (`payment_status`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (6,5,5000.00,'Infrastructure','',0,'2025-12-28 12:55:42','Completed'),(7,6,1000.00,'General','',1,'2025-12-31 12:58:19','Completed');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attendance_status` enum('Registered','Attended','Cancelled') DEFAULT 'Registered',
  `checked_in` tinyint(1) DEFAULT '0',
  `checked_in_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`event_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `event_type` enum('Networking','Workshop','Reunion','Seminar','Other') DEFAULT 'Other',
  `organizer_id` int DEFAULT NULL,
  `max_attendees` int DEFAULT NULL,
  `current_attendees` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `registration_deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','cancelled','completed') DEFAULT 'active',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organizer_id` (`organizer_id`),
  KEY `idx_events_date` (`event_date`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (5,'Alumni Connect Annual Meet 2026','Alumni Connect Annual Meet 2026 brings together alumni, faculty, and students to celebrate shared memories and build meaningful professional connections.\n\nThe event will feature keynote sessions by distinguished alumni, networking opportunities, cultural performances, and interactive discussions aimed at strengthening alumni engagement with the institution.\n','2026-02-15','10:00:00','College Main Auditorium','Networking',1,300,0,'https://images.unsplash.com/photo-1521737604893-d14cc237f11d','2026-03-10','2026-01-13 11:29:34','active',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_applications`
--

DROP TABLE IF EXISTS `job_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `applicant_id` int NOT NULL,
  `cover_letter` text,
  `resume_url` varchar(255) DEFAULT NULL,
  `status` enum('Applied','Reviewed','Shortlisted','Rejected') DEFAULT 'Applied',
  `applied_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `applicant_id` (`applicant_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_applications_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_applications`
--

LOCK TABLES `job_applications` WRITE;
/*!40000 ALTER TABLE `job_applications` DISABLE KEYS */;
INSERT INTO `job_applications` VALUES (2,1,1,'','','Applied','2025-12-26 17:36:55',NULL,NULL),(4,4,6,'','','Applied','2025-12-31 13:13:31',NULL,NULL);
/*!40000 ALTER TABLE `job_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `posted_by` int DEFAULT NULL,
  `company_name` varchar(100) NOT NULL,
  `job_title` varchar(100) NOT NULL,
  `job_description` text,
  `requirements` text,
  `location` varchar(100) DEFAULT NULL,
  `job_type` enum('Full-time','Part-time','Internship','Contract') DEFAULT 'Full-time',
  `salary_range` varchar(50) DEFAULT NULL,
  `application_deadline` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `posted_by` (`posted_by`),
  KEY `idx_job_active` (`is_active`),
  CONSTRAINT `job_postings_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES (1,1,'Tech Innovations','Frontend Developer','Looking for React developers',NULL,'Mohali','Full-time',NULL,NULL,1,'2025-12-26 15:41:07','2025-12-31 08:58:26'),(2,1,'Capgemini','Software Engineer','Capgemini is looking for aspiring software engineers, apply before the deadline!','CGPA: 7.0\nNo Backlogs.','Bengaluru','Full-time','5.5 LPA','2025-12-29',1,'2025-12-27 13:06:49','2025-12-31 08:57:20'),(3,1,'Capgemini','Software Engineer','Capgemini is hiring Software Engineers, eligible students submit applications as soon as possible.','Minimum 7.5 CGPA, No active backlogs','Bengaluru','Full-time','5.5 LPA','2026-01-03',1,'2025-12-31 10:00:53','2025-12-31 10:01:14'),(4,1,'Capgemini','Software Engineer','Software Engineer','Minimum 7.0 CGPA\nNo active backlogs\nGood Communication Skills','Bengaluru','Full-time','5.5 LPA','2026-01-03',1,'2025-12-31 13:12:41',NULL);
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentorship`
--

DROP TABLE IF EXISTS `mentorship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentorship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mentor_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `expertise_area` varchar(100) DEFAULT NULL,
  `availability` enum('Available','Limited','Unavailable') DEFAULT 'Available',
  `max_mentees` int DEFAULT '5',
  `current_mentees` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `mentor_id` (`mentor_id`),
  KEY `idx_mentorship_status` (`status`),
  CONSTRAINT `mentorship_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentorship`
--

LOCK TABLES `mentorship` WRITE;
/*!40000 ALTER TABLE `mentorship` DISABLE KEYS */;
INSERT INTO `mentorship` VALUES (1,2,'Career Guidance in Tech','Helping students navigate tech careers','Technology','Available',5,1,'2025-12-26 15:41:07','active'),(2,5,'DSA Guidance','DSA Guidance\nDaily classes for 1 week\n100% commitment needed.','Career Guidance','Available',9,1,'2025-12-31 08:43:48','active');
/*!40000 ALTER TABLE `mentorship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentorship_applications`
--

DROP TABLE IF EXISTS `mentorship_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentorship_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mentorship_id` int NOT NULL,
  `mentee_id` int NOT NULL,
  `application_text` text,
  `status` enum('Pending','Accepted','Rejected','Completed') DEFAULT 'Pending',
  `applied_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `mentorship_id` (`mentorship_id`),
  KEY `mentee_id` (`mentee_id`),
  CONSTRAINT `mentorship_applications_ibfk_1` FOREIGN KEY (`mentorship_id`) REFERENCES `mentorship` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mentorship_applications_ibfk_2` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentorship_applications`
--

LOCK TABLES `mentorship_applications` WRITE;
/*!40000 ALTER TABLE `mentorship_applications` DISABLE KEYS */;
INSERT INTO `mentorship_applications` VALUES (1,1,6,'I want career guidance.','Pending','2025-12-28 13:14:00'),(2,2,6,'I want DSA Guidance','Accepted','2025-12-31 08:44:20');
/*!40000 ALTER TABLE `mentorship_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_updates`
--

DROP TABLE IF EXISTS `news_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `author_id` int DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `news_updates_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_updates`
--

LOCK TABLES `news_updates` WRITE;
/*!40000 ALTER TABLE `news_updates` DISABLE KEYS */;
INSERT INTO `news_updates` VALUES (1,'University Ranked #1 in Karnataka','Our university has been ranked first in Karnataka for technical education.',NULL,'Achievements',NULL,1,'2025-12-26 15:41:07','2026-01-13 11:18:57');
/*!40000 ALTER TABLE `news_updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_verifications`
--

DROP TABLE IF EXISTS `user_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `action` enum('approved','rejected','deleted') NOT NULL,
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_user_verifications_user` (`user_id`),
  CONSTRAINT `user_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_verifications_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_verifications`
--

LOCK TABLES `user_verifications` WRITE;
/*!40000 ALTER TABLE `user_verifications` DISABLE KEYS */;
INSERT INTO `user_verifications` VALUES (4,3,1,'approved',NULL,'2025-12-28 11:55:55'),(5,2,1,'approved',NULL,'2025-12-28 11:55:57'),(7,3,1,'approved',NULL,'2025-12-28 11:56:02'),(8,5,1,'approved',NULL,'2025-12-28 12:53:47'),(10,6,1,'approved',NULL,'2025-12-28 13:00:00'),(11,5,1,'approved',NULL,'2026-01-13 08:29:04');
/*!40000 ALTER TABLE `user_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `graduation_year` int DEFAULT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `current_job_title` varchar(100) DEFAULT NULL,
  `current_company` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usn_number` varchar(50) DEFAULT NULL,
  `id_card_url` varchar(255) DEFAULT NULL,
  `role` enum('student','alumni','admin') NOT NULL DEFAULT 'student',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `usn_number` (`usn_number`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_verified` (`is_verified`),
  KEY `idx_users_usn` (`usn_number`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_role_verified` (`role`,`is_verified`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@alumni.edu','$2a$10$Tsb3pWsFcj3AdhbuaD0SwOIkHvSYVsWzC7pLfzjZCULKRy8XkHWpi','Admin','User',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2025-12-26 15:41:07','2025-12-28 13:07:17',NULL,NULL,'admin'),(2,'john.doe@example.com','$2b$10$hashedpass','John','Doe',2015,'B.Tech','Computer Science','Software Engineer','Tech Corp','Punjab',NULL,NULL,NULL,0,1,'2025-12-26 15:41:07','2025-12-28 13:07:16',NULL,NULL,'alumni'),(3,'jane.smith@example.com','$2b$10$hashedpass','Jane','Smith',2018,'MBA','Business Administration','Marketing Manager','Business Solutions','Chandigarh',NULL,NULL,NULL,0,1,'2025-12-26 15:41:07','2025-12-28 13:07:16',NULL,NULL,'alumni'),(5,'lohit@gmail.com','$2a$10$RYgSIDFZlVKrkM.LSReqmeDYSB1g6lgwiCDLma/DRd8eqW/h5Da8K','Lohith','Gowda',2025,'B.Tech','CSE',NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2025-12-28 11:51:16','2025-12-28 13:07:16','1PUC1234','/uploads/1766922676320-631570247.pdf','alumni'),(6,'mohith@gmail.com','$2a$10$RAfjXx7LAkfCPfEeNUm9XOwnFmuKh6vLF5eUcj4i5KP1CkDWyyGTm','Mohith','Gowda',NULL,'B.Tech','CSE',NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2025-12-28 12:59:24','2025-12-28 13:00:00','1PUC12345','/uploads/1766926763895-221571648.pdf','student');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-14 16:21:32
