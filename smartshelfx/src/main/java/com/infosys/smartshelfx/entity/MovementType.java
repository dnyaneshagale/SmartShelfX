package com.infosys.smartshelfx.entity;

public enum MovementType {
    RECEIVING, // Stock received from vendor
    DISPATCHING, // Stock dispatched/sold
    ADJUSTMENT, // Manual adjustment (correction)
    RETURN, // Customer return
    DAMAGE, // Damaged stock
    TRANSFER_IN, // Transfer from another warehouse
    TRANSFER_OUT, // Transfer to another warehouse
    RESTOCK // Auto-restock order received
}
