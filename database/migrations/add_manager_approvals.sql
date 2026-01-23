-- Migration: Add manager_approval_requests table
-- Date: 2024-01-XX
-- Description: Adds table to track manager approval requests requiring admin approval

CREATE TABLE IF NOT EXISTS manager_approval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    remarks VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_manager_approval_status ON manager_approval_requests(status);
CREATE INDEX idx_manager_approval_user ON manager_approval_requests(user_id);
