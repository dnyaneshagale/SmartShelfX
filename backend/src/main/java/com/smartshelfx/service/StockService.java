package com.smartshelfx.service;

import com.smartshelfx.dto.StockTransactionRequest;
import com.smartshelfx.model.Product;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.model.StockTransaction;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.PurchaseOrderRepository;
import com.smartshelfx.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {
    
    @Autowired
    private StockTransactionRepository transactionRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private StockApprovalService stockApprovalService;
    
    @Transactional
    public Object recordTransaction(StockTransactionRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        StockTransaction.TransactionType type = StockTransaction.TransactionType.valueOf(request.getTransactionType());
        
        // For Stock IN, create approval request if vendor is assigned
        if (type == StockTransaction.TransactionType.IN) {
            if (product.getVendor() != null) {
                // Create approval request instead of directly adding stock
                return stockApprovalService.createApprovalRequest(
                    request.getProductId(),
                    request.getQuantity(),
                    request.getRemarks(),
                    request.getRequestedById()
                );
            }
            // If no vendor assigned, proceed with direct stock in
            product.setCurrentStock(product.getCurrentStock() + request.getQuantity());
        } else {
            // Stock OUT - direct transaction
            if (product.getCurrentStock() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock");
            }
            product.setCurrentStock(product.getCurrentStock() - request.getQuantity());
        }
        
        productRepository.save(product);
        
        // Check if stock went below reorder level and create PO if needed
        checkAndCreatePurchaseOrder(product);
        
        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setTransactionType(type);
        transaction.setQuantity(request.getQuantity());
        transaction.setRemarks(request.getRemarks());
        
        return transactionRepository.save(transaction);
    }
    
    private void checkAndCreatePurchaseOrder(Product product) {
        // Only create PO if stock is below reorder level and vendor is assigned
        if (product.getCurrentStock() < product.getReorderLevel() && product.getVendor() != null) {
            // Check if there's already a pending PO for this product
            List<PurchaseOrder> existingPOs = purchaseOrderRepository
                    .findByProductIdAndStatus(product.getId(), PurchaseOrder.Status.PENDING);
            
            if (existingPOs.isEmpty()) {
                // Calculate order quantity: restock to double the reorder level
                int orderQuantity = Math.max(
                        product.getReorderLevel(),
                        (product.getReorderLevel() * 2) - product.getCurrentStock()
                );
                
                // Create new purchase order
                PurchaseOrder po = new PurchaseOrder();
                po.setProduct(product);
                po.setVendor(product.getVendor());
                po.setQuantity(orderQuantity);
                po.setStatus(PurchaseOrder.Status.PENDING);
                po.setPoNumber("PO-" + System.currentTimeMillis());
                
                purchaseOrderRepository.save(po);
            }
        }
    }
    
    public List<StockTransaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductId(productId);
    }
    
    public List<StockTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
