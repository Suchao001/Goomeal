-- Add unique_id column to eating_record table
-- This column will store a 5-digit identifier for plan items in format DDMII
-- Where DD = day, M = meal index (0-2 for breakfast/lunch/dinner), II = item index

ALTER TABLE eating_record 
ADD COLUMN unique_id VARCHAR(5) NULL;

-- Add index for efficient lookups when checking saved status
CREATE INDEX idx_eating_record_unique_id ON eating_record(unique_id);

-- Note: unique_id will be NULL for manually added items (not from plan)
-- Only plan items will have unique_id values to track their saved status
