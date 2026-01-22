package com.smartshelfx.service;

import com.smartshelfx.model.Product;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.PurchaseOrderRepository;
import com.smartshelfx.repository.StockTransactionRepository;
import com.smartshelfx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    public List<Product> getProductsByVendor(Long vendorId) {
        return productRepository.findByVendorId(vendorId);
    }
    
    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
    
    @Transactional
    public Product createProduct(Product product) {
        if (product.getVendor() != null && product.getVendor().getId() != null) {
            User vendor = userRepository.findById(product.getVendor().getId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            product.setVendor(vendor);
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Auto-create purchase order if stock is below reorder level and vendor is assigned
        if (savedProduct.getCurrentStock() < savedProduct.getReorderLevel() && savedProduct.getVendor() != null) {
            createAutoPurchaseOrder(savedProduct);
        }
        
        return savedProduct;
    }
    
    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setSku(productDetails.getSku());
        product.setName(productDetails.getName());
        product.setCategory(productDetails.getCategory());
        product.setPrice(productDetails.getPrice());
        product.setCurrentStock(productDetails.getCurrentStock());
        product.setReorderLevel(productDetails.getReorderLevel());
        
        if (productDetails.getVendor() != null && productDetails.getVendor().getId() != null) {
            User vendor = userRepository.findById(productDetails.getVendor().getId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            product.setVendor(vendor);
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Auto-create purchase order if stock is below reorder level and vendor is assigned
        if (savedProduct.getCurrentStock() < savedProduct.getReorderLevel() && savedProduct.getVendor() != null) {
            createAutoPurchaseOrder(savedProduct);
        }
        
        return savedProduct;
    }
    
    private void createAutoPurchaseOrder(Product product) {
        // Check if there's already a pending PO for this product
        List<PurchaseOrder> existingPOs = purchaseOrderRepository.findByProductIdAndStatus(
            product.getId(), 
            PurchaseOrder.Status.PENDING
        );
        
        if (existingPOs.isEmpty()) {
            PurchaseOrder po = new PurchaseOrder();
            po.setProduct(product);
            po.setVendor(product.getVendor());
            // Order enough to reach 2x the reorder level
            int orderQuantity = (product.getReorderLevel() * 2) - product.getCurrentStock();
            po.setQuantity(Math.max(orderQuantity, product.getReorderLevel()));
            po.setStatus(PurchaseOrder.Status.PENDING);
            purchaseOrderRepository.save(po);
        }
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        // First, delete all related stock transactions
        stockTransactionRepository.deleteAll(
            stockTransactionRepository.findByProductId(id)
        );
        
        // Delete all related purchase orders
        purchaseOrderRepository.deleteAll(
            purchaseOrderRepository.findByProductId(id)
        );
        
        // Finally, delete the product
        productRepository.deleteById(id);
    }
    
    @Transactional
    public Product assignVendor(Long productId, Long vendorId) {
        Product product = getProductById(productId);
        
        if (vendorId != null) {
            User vendor = userRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            product.setVendor(vendor);
        } else {
            product.setVendor(null);
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Auto-create purchase order if stock is below reorder level and vendor is assigned
        if (savedProduct.getCurrentStock() < savedProduct.getReorderLevel() && savedProduct.getVendor() != null) {
            createAutoPurchaseOrder(savedProduct);
        }
        
        return savedProduct;
    }
}
