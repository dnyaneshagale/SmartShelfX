package com.smartshelfx.service;

import com.smartshelfx.dto.PurchaseOrderRequest;
import com.smartshelfx.model.Product;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PurchaseOrderService {
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockService stockService;
    
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }
    
    public List<PurchaseOrder> getPurchaseOrdersByVendor(Long vendorId) {
        return purchaseOrderRepository.findByVendorId(vendorId);
    }
    
    public List<PurchaseOrder> getPendingPurchaseOrders() {
        return purchaseOrderRepository.findByStatus(PurchaseOrder.Status.PENDING);
    }
    
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getVendor() == null) {
            throw new RuntimeException("Product has no assigned vendor");
        }
        
        PurchaseOrder po = new PurchaseOrder();
        po.setProduct(product);
        po.setVendor(product.getVendor());
        po.setQuantity(request.getQuantity());
        po.setStatus(PurchaseOrder.Status.PENDING);
        
        return purchaseOrderRepository.save(po);
    }
    
    @Transactional
    public PurchaseOrder approvePurchaseOrder(Long poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        
        po.setStatus(PurchaseOrder.Status.APPROVED);
        po.setApprovedAt(LocalDateTime.now());
        
        // Auto-update stock
        Product product = po.getProduct();
        product.setCurrentStock(product.getCurrentStock() + po.getQuantity());
        productRepository.save(product);
        
        return purchaseOrderRepository.save(po);
    }
    
    public PurchaseOrder rejectPurchaseOrder(Long poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        
        po.setStatus(PurchaseOrder.Status.REJECTED);
        return purchaseOrderRepository.save(po);
    }
}
