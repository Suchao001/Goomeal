-- Create daily_nutrition_summary table
CREATE TABLE IF NOT EXISTS `daily_nutrition_summary` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `summary_date` date NOT NULL,
  `total_calories` int(11) DEFAULT NULL,
  `total_fat` int(11) DEFAULT NULL,
  `total_protein` int(11) DEFAULT NULL,
  `total_carbs` int(11) DEFAULT NULL,
  `recommendation` text DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_date_unique` (`user_id`, `summary_date`),
  KEY `idx_user_date` (`user_id`, `summary_date`),
  KEY `idx_summary_date` (`summary_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add foreign key constraint (optional, if you want to enforce referential integrity)
-- ALTER TABLE `daily_nutrition_summary` 
-- ADD CONSTRAINT `fk_daily_summary_user` 
-- FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
