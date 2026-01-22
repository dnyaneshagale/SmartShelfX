package com.smartshelfx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartShelfXApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SmartShelfXApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("SmartShelfX Backend Started Successfully!");
        // System.out.println("API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("========================================\n");
    }
}
