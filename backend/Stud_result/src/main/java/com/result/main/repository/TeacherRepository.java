package com.result.main.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.result.main.entity.Teacher;
import com.result.main.entity.User;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    // Find teacher by their User account
    Optional<Teacher> findByUser(User user);
}