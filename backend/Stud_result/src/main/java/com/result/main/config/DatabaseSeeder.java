package com.result.main.config;

import com.result.main.entity.Role;
import com.result.main.entity.User;
import com.result.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Check if the admin user already exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword("admin@01"); // In a real app, use BCryptPasswordEncoder
                admin.setRole(Role.ADMIN);
                
                userRepository.save(admin);
                System.out.println("✅ Default Admin account created: admin / admin@01");
            } else {
                System.out.println("ℹ️ Admin account already exists.");
            }
        };
    }
}
