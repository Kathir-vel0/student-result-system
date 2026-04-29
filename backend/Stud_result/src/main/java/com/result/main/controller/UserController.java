package com.result.main.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.*;

import com.result.main.entity.User;
import com.result.main.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🔹 Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Create new user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // 🔹 Simple login check
    @PostMapping("/login")
    public String login(@RequestBody User loginRequest) {

        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());

        if (user.isPresent() &&
            user.get().getPassword().equals(loginRequest.getPassword())) {

            // 🔥 ADD ID HERE
            return "Login Successful as " + user.get().getRole() + " id:" + user.get().getId();
        }

        return "Invalid Username or Password";
    }
}