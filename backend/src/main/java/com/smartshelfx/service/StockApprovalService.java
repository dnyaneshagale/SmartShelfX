package com.smartshelfx.service;

import com.smartshelfx.model.Product;
import com.smartshelfx.model.StockApprovalRequest;
import com.smartshelfx.model.StockTransaction;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.StockApprovalRequestRepository;
import com.smartshelfx.repository.StockTransactionRepository;
import com.smartshelfx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockApprovalService {
    
    @Autowired
    private StockApprovalRequestRepository approvalRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockTransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public StockApprovalRequest createApprovalRequest(Long productId, Integer quantity, String remarks, Long requestedById) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getVendor() == null) {
            throw new RuntimeException("Product has no assigned vendor");
        }
        
        User requestedBy = userRepository.findById(requestedById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StockApprovalRequest request = new StockApprovalRequest();
        request.setProduct(product);
        request.setVendor(product.getVendor());
        request.setRequestedBy(requestedBy);
        request.setQuantity(quantity);
        request.setRemarks(remarks);
        request.setStatus(StockApprovalRequest.Status.PENDING);
        
        return approvalRepository.save(request);
    }
    
    @Transactional
    public StockApprovalRequest approveRequest(Long requestId, String vendorRemarks) {
        StockApprovalRequest request = approvalRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));
        
        if (request.getStatus() != StockApprovalRequest.Status.PENDING) {
            throw new RuntimeException("Request has already been processed");
        }
        
        // Update request status
        request.setStatus(StockApprovalRequest.Status.APPROVED);
        request.setRespondedAt(LocalDateTime.now());
        request.setVendorRemarks(vendorRemarks);
        approvalRepository.save(request);
        
        // Add stock to product
        Product product = request.getProduct();
        product.setCurrentStock(product.getCurrentStock() + request.getQuantity());
        productRepository.save(product);
        
        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setTransactionType(StockTransaction.TransactionType.IN);
        transaction.setQuantity(request.getQuantity());
        transaction.setRemarks("Approved stock in request #" + requestId + 
                              (vendorRemarks != null ? " - " + vendorRemarks : ""));
        transactionRepository.save(transaction);
        
        return request;
    }
    
    @Transactional
    public StockApprovalRequest rejectRequest(Long requestId, String vendorRemarks) {
        StockApprovalRequest request = approvalRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));
        
        if (request.getStatus() != StockApprovalRequest.Status.PENDING) {
            throw new RuntimeException("Request has already been processed");
        }
        
        request.setStatus(StockApprovalRequest.Status.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        request.setVendorRemarks(vendorRemarks);
        
        return approvalRepository.save(request);
    }
    
    public List<StockApprovalRequest> getRequestsByVendor(Long vendorId) {
        return approvalRepository.findByVendorId(vendorId);
    }
    
    public List<StockApprovalRequest> getPendingRequestsByVendor(Long vendorId) {
        return approvalRepository.findByVendorIdAndStatus(vendorId, StockApprovalRequest.Status.PENDING);
    }
    
    public List<StockApprovalRequest> getAllRequests() {
        return approvalRepository.findAll();
    }
}
