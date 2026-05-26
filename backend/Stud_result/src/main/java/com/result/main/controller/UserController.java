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

    // 🔹 Get all users (Admin only)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Public Student Registration
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // Validation: Empty inputs
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username is required"));
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password is required"));
        }

        // Security reinforcement: Force STUDENT role, do not trust frontend value!
        user.setRole(Role.STUDENT);
        user.setCreatedBy("SELF_REGISTERED");

        // Prevention of duplicate usernames
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username is already taken"));
        }

        // Hashing password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        
        // Hide password hash from response
        savedUser.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // 🔹 Secure JWT Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username and password are required"));
        }

        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                
                // Generate secure JWT
                String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("role", user.getRole().name());
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("message", "Login Successful");

                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Username or Password"));
    }

    // 🔹 Secure Admin Endpoint: Reset Teacher Password
    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");

        if (username == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Username and new password are required"));
        }

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful for user: " + username));
    }
}