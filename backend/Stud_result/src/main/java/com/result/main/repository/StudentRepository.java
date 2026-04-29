package com.result.main.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.result.main.entity.Student;
import com.result.main.entity.User;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(User user);

    Optional<Student> findByStudentId(String studentId);
}