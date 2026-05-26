package com.result.main.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.result.main.entity.User;
import com.result.main.entity.Role;
import com.result.main.repository.UserRepository;
import com.result.main.config.JwtUtils;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    // Helper method to detect if a password in the DB is already BCrypt hashed
    private boolean isBCryptHashed(String password) {
        if (password == null) return false;
        // BCrypt hashes always start with $2a$, $2b$, or $2y$ and are exactly 60 characters long
        return password.length() == 60 && 
               (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }

    // 🔹 Get all users (Admin only)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Public Student Registration
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        System.out.println("🔍 Public register attempt for username: " + user.getUsername());
        
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username is required"));
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password is required"));
        }

        // Force STUDENT role and save
        user.setRole(Role.STUDENT);
        user.setCreatedBy("SELF_REGISTERED");

        if (userRepository.existsByUsername(user.getUsername())) {
            System.out.println("⚠️ Registration failed: Username " + user.getUsername() + " is duplicate");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username is already taken"));
        }

        // Securely hash password using BCrypt
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        System.out.println("✅ Public registration successful for Student: " + user.getUsername());

        savedUser.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // 🔹 Secure JWT Login with Migration-Safe Password check
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        String username = loginRequest.getUsername();
        String plainPassword = loginRequest.getPassword();

        System.out.println("\n--- 🔍 LOGIN ATTEMPT ---");
        System.out.println("🔍 Username received: " + username);

        if (username == null || plainPassword == null || username.trim().isEmpty() || plainPassword.isEmpty()) {
            System.out.println("❌ Login failed: Empty username or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username and password are required"));
        }

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String dbPassword = user.getPassword();
            Role role = user.getRole();

            System.out.println("🔍 User found in DB! Assigned Role: " + role);
            
            boolean isMatched = false;
            boolean wasPlainTextMatch = false;

            if (isBCryptHashed(dbPassword)) {
                System.out.println("🔍 Password storage format: BCrypt Hashed");
                isMatched = passwordEncoder.matches(plainPassword, dbPassword);
            } else {
                System.out.println("🔍 Password storage format: Plain Text (migration candidate)");
                // Direct plain text comparison
                wasPlainTextMatch = dbPassword.equals(plainPassword);
                isMatched = wasPlainTextMatch;
            }

            if (isMatched) {
                // If it matched as plain text, migrate it to a secure BCrypt hash automatically
                if (wasPlainTextMatch) {
                    user.setPassword(passwordEncoder.encode(plainPassword));
                    userRepository.save(user);
                    System.out.println("🔄 AUTO-MIGRATION SUCCESS: Plain text password converted to BCrypt for user: " + username);
                }

                // Ensure the role is consistently mapped to UPPERCASE string
                String roleString = role.name().toUpperCase();

                // Generate secure JWT token
                String token = jwtUtils.generateToken(user.getUsername(), roleString, user.getId());
                System.out.println("✅ Login Successful for: " + username + " with role: " + roleString);

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("role", roleString);
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("message", "Login Successful");

                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Login failed: Password mismatch for user: " + username);
            }
        } else {
            System.out.println("❌ Login failed: Username not found: " + username);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Username or Password"));
    }

    // 🔹 Secure Admin Endpoint: Reset Teacher Password
    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");

        System.out.println("🔍 Password reset requested for user: " + username);

        if (username == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username and new password are required"));
        }

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            System.out.println("❌ Reset failed: User not found: " + username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        System.out.println("✅ Reset successful. Password hashed for user: " + username);

        return ResponseEntity.ok(Map.of("message", "Password reset successful for user: " + username));
    }
}