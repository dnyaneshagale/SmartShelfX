package com.smartshelfx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class SmartShelfXApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SmartShelfXApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("SmartShelfX Backend Started Successfully!");
        System.out.println("========================================\n");
    }
}
