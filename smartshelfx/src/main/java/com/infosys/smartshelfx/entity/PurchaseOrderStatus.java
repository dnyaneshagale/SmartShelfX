package com.infosys.smartshelfx.entity;

public enum PurchaseOrderStatus {
    DRAFT, // PO created but not submitted
    PENDING, // Submitted, awaiting approval
    APPROVED, // Approved by admin/manager
    REJECTED, // Rejected
    SENT, // Sent to vendor
    ACKNOWLEDGED, // Vendor acknowledged receipt
    PARTIALLY_RECEIVED, // Some items received
    RECEIVED, // All items received
    CANCELLED, // Cancelled
    CLOSED // Completed and closed
}
