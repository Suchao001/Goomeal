-- SQL Script for user_food_plan_using table
-- This table manages which food plan is currently being used by each user

CREATE TABLE user_food_plan_using (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_plan_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    is_repeat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_plan_id) REFERENCES user_food_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_current_plan (user_id)
);

-- Index for better performance
CREATE INDEX idx_user_food_plan_using_user_id ON user_food_plan_using(user_id);
CREATE INDEX idx_user_food_plan_using_food_plan_id ON user_food_plan_using(food_plan_id);

-- Add comment for documentation
ALTER TABLE user_food_plan_using COMMENT = 'Table to track which food plan is currently being used by each user';

-- Sample usage:
-- 1. When user sets a plan as current: INSERT or UPDATE user_food_plan_using
-- 2. When user wants to get current plan: JOIN with user_food_plans table
-- 3. Each user can only have one current plan (enforced by unique constraint)
