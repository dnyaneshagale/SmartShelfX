-- Create stock approval requests table
CREATE TABLE IF NOT EXISTS stock_approval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks VARCHAR(500),
    vendor_remarks VARCHAR(500),
    created_at DATETIME NOT NULL,
    responded_at DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
);
