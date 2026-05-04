package com.result.main.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.result.main.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by username (for login)
    Optional<User> findByUsername(String username);

    // Check if user exists by username
    boolean existsByUsername(String username);
}