package com.smartshelfx.test;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "password123";
        
        // Generate new hash
        String hash = encoder.encode(rawPassword);
        System.out.println("Generated BCrypt Hash for 'password123':");
        System.out.println(hash);
        System.out.println();
        
        // Test the provided hash
        String providedHash = "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQNkhCvd1YkfPW7eHJ5ze";
        boolean matches = encoder.matches(rawPassword, providedHash);
        System.out.println("Testing provided hash: " + providedHash);
        System.out.println("Does 'password123' match? " + matches);
        System.out.println();
        
        // Test with the generated hash
        System.out.println("Testing newly generated hash:");
        System.out.println("Does 'password123' match? " + encoder.matches(rawPassword, hash));
    }
}
