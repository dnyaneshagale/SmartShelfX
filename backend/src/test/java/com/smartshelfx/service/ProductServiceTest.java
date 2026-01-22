package com.smartshelfx.service;

import com.smartshelfx.model.Product;
import com.smartshelfx.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ProductServiceTest {
    
    @Autowired
    private ProductService productService;
    
    @Test
    public void testGetAllProducts() {
        var products = productService.getAllProducts();
        assertNotNull(products);
    }
}
