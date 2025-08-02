-- Migration to add missing columns to user_food table
-- Execute this SQL in your database

-- Add src column to track food source (user or ai)
ALTER TABLE `user_food` 
ADD COLUMN `src` varchar(50) DEFAULT 'user' COMMENT 'Source of food: user or ai';

-- Add created_at and updated_at columns for better tracking
ALTER TABLE `user_food` 
ADD COLUMN `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time';

-- Update existing records to have src = 'user' (since they were added by users)
UPDATE `user_food` SET `src` = 'user' WHERE `src` IS NULL;

-- Add index for better performance
ALTER TABLE `user_food` 
ADD INDEX `idx_user_id_created_at` (`user_id`, `created_at`),
ADD INDEX `idx_src` (`src`);
