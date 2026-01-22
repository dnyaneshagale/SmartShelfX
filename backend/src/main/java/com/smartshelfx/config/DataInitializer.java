package com.smartshelfx.config;

import com.smartshelfx.model.*;
import com.smartshelfx.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (userRepository.count() > 0) {
            return;
        }
        
        // Create Admin User
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@smartshelfx.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("System Administrator");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        
        // Create Manager User
        User manager = new User();
        manager.setUsername("manager1");
        manager.setEmail("manager@smartshelfx.com");
        manager.setPassword(passwordEncoder.encode("manager123"));
        manager.setFullName("John Manager");
        manager.setRole(Role.MANAGER);
        userRepository.save(manager);
        
        // Create Vendor Users
        User vendor1 = new User();
        vendor1.setUsername("vendor1");
        vendor1.setEmail("vendor1@supplies.com");
        vendor1.setPassword(passwordEncoder.encode("vendor123"));
        vendor1.setFullName("ABC Supplies Ltd");
        vendor1.setRole(Role.VENDOR);
        userRepository.save(vendor1);
        
        User vendor2 = new User();
        vendor2.setUsername("vendor2");
        vendor2.setEmail("vendor2@wholesale.com");
        vendor2.setPassword(passwordEncoder.encode("vendor123"));
        vendor2.setFullName("XYZ Wholesale Co");
        vendor2.setRole(Role.VENDOR);
        userRepository.save(vendor2);
        
        // Create Products
        Product product1 = new Product();
        product1.setSku("SKU001");
        product1.setName("Wireless Mouse");
        product1.setCategory("Electronics");
        product1.setPrice(new BigDecimal("29.99"));
        product1.setCurrentStock(150);
        product1.setReorderLevel(50);
        product1.setVendor(vendor1);
        productRepository.save(product1);
        
        Product product2 = new Product();
        product2.setSku("SKU002");
        product2.setName("USB-C Cable");
        product2.setCategory("Electronics");
        product2.setPrice(new BigDecimal("12.99"));
        product2.setCurrentStock(300);
        product2.setReorderLevel(100);
        product2.setVendor(vendor1);
        productRepository.save(product2);
        
        Product product3 = new Product();
        product3.setSku("SKU003");
        product3.setName("Laptop Stand");
        product3.setCategory("Accessories");
        product3.setPrice(new BigDecimal("49.99"));
        product3.setCurrentStock(75);
        product3.setReorderLevel(25);
        product3.setVendor(vendor2);
        productRepository.save(product3);
        
        Product product4 = new Product();
        product4.setSku("SKU004");
        product4.setName("Wireless Keyboard");
        product4.setCategory("Electronics");
        product4.setPrice(new BigDecimal("59.99"));
        product4.setCurrentStock(120);
        product4.setReorderLevel(40);
        product4.setVendor(vendor1);
        productRepository.save(product4);
        
        Product product5 = new Product();
        product5.setSku("SKU005");
        product5.setName("HDMI Cable");
        product5.setCategory("Electronics");
        product5.setPrice(new BigDecimal("15.99"));
        product5.setCurrentStock(200);
        product5.setReorderLevel(75);
        product5.setVendor(vendor2);
        productRepository.save(product5);
        
        Product product6 = new Product();
        product6.setSku("SKU006");
        product6.setName("Webcam HD");
        product6.setCategory("Electronics");
        product6.setPrice(new BigDecimal("79.99"));
        product6.setCurrentStock(45);
        product6.setReorderLevel(20);
        product6.setVendor(vendor1);
        productRepository.save(product6);
        
        Product product7 = new Product();
        product7.setSku("SKU007");
        product7.setName("Desk Lamp");
        product7.setCategory("Accessories");
        product7.setPrice(new BigDecimal("39.99"));
        product7.setCurrentStock(90);
        product7.setReorderLevel(30);
        product7.setVendor(vendor2);
        productRepository.save(product7);
        
        Product product8 = new Product();
        product8.setSku("SKU008");
        product8.setName("Notebook A4");
        product8.setCategory("Stationery");
        product8.setPrice(new BigDecimal("4.99"));
        product8.setCurrentStock(500);
        product8.setReorderLevel(150);
        product8.setVendor(vendor2);
        productRepository.save(product8);
        
        // Create Stock Transactions
        StockTransaction transaction1 = new StockTransaction();
        transaction1.setProduct(product1);
        transaction1.setTransactionType(StockTransaction.TransactionType.IN);
        transaction1.setQuantity(200);
        transaction1.setTransactionDate(LocalDateTime.now().minusDays(30));
        transaction1.setRemarks("Initial stock");
        stockTransactionRepository.save(transaction1);
        
        StockTransaction transaction2 = new StockTransaction();
        transaction2.setProduct(product1);
        transaction2.setTransactionType(StockTransaction.TransactionType.OUT);
        transaction2.setQuantity(50);
        transaction2.setTransactionDate(LocalDateTime.now().minusDays(15));
        transaction2.setRemarks("Sales order");
        stockTransactionRepository.save(transaction2);
        
        StockTransaction transaction3 = new StockTransaction();
        transaction3.setProduct(product2);
        transaction3.setTransactionType(StockTransaction.TransactionType.IN);
        transaction3.setQuantity(400);
        transaction3.setTransactionDate(LocalDateTime.now().minusDays(25));
        transaction3.setRemarks("Initial stock");
        stockTransactionRepository.save(transaction3);
        
        StockTransaction transaction4 = new StockTransaction();
        transaction4.setProduct(product2);
        transaction4.setTransactionType(StockTransaction.TransactionType.OUT);
        transaction4.setQuantity(100);
        transaction4.setTransactionDate(LocalDateTime.now().minusDays(10));
        transaction4.setRemarks("Sales order");
        stockTransactionRepository.save(transaction4);
        
        // Create Purchase Orders
        PurchaseOrder order1 = new PurchaseOrder();
        order1.setProduct(product6);
        order1.setVendor(vendor1);
        order1.setQuantity(50);
        order1.setStatus(PurchaseOrder.Status.PENDING);
        order1.setCreatedAt(LocalDateTime.now().minusDays(5));
        purchaseOrderRepository.save(order1);
        
        PurchaseOrder order2 = new PurchaseOrder();
        order2.setProduct(product3);
        order2.setVendor(vendor2);
        order2.setQuantity(30);
        order2.setStatus(PurchaseOrder.Status.APPROVED);
        order2.setCreatedAt(LocalDateTime.now().minusDays(3));
        order2.setApprovedAt(LocalDateTime.now().minusDays(2));
        purchaseOrderRepository.save(order2);
        
        PurchaseOrder order3 = new PurchaseOrder();
        order3.setProduct(product1);
        order3.setVendor(vendor1);
        order3.setQuantity(100);
        order3.setStatus(PurchaseOrder.Status.PENDING);
        order3.setCreatedAt(LocalDateTime.now().minusDays(1));
        purchaseOrderRepository.save(order3);
        
        System.out.println("========================================");
        System.out.println("Demo Data Initialized Successfully!");
        System.out.println("========================================");
        System.out.println("Users:");
        System.out.println("  Admin: admin@smartshelfx.com / admin123");
        System.out.println("  Manager: manager@smartshelfx.com / manager123");
        System.out.println("  Vendor 1: vendor1@supplies.com / vendor123");
        System.out.println("  Vendor 2: vendor2@wholesale.com / vendor123");
        System.out.println("Products: 8 items created");
        System.out.println("Stock Transactions: 4 transactions created");
        System.out.println("Purchase Orders: 3 orders created");
        System.out.println("========================================");
    }
}
