package com.result.main.config;

import com.result.main.entity.Role;
import com.result.main.entity.User;
import com.result.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if the admin user already exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin@01")); // SECURE BCrypt Hashing
                admin.setRole(Role.ADMIN);
                admin.setCreatedBy("SYSTEM");
                
                userRepository.save(admin);
                System.out.println("✅ Default Admin account created: admin / admin@01 (hashed)");
            } else {
                System.out.println("ℹ️ Admin account already exists.");
            }
        };
    }
}
