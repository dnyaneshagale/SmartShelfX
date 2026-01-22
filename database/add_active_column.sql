-- Add active column to users table
ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

-- Set all existing users to active
UPDATE users SET active = TRUE;
