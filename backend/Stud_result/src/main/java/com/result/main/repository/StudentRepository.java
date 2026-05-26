package com.result.main.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.result.main.entity.Student;
import com.result.main.entity.User;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(User user);

    Optional<Student> findByStudentId(String studentId);

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:className IS NULL OR :className = '' OR s.className = :className) AND " +
           "(:section IS NULL OR :section = '' OR s.section = :section)")
    Page<Student> searchStudents(
            @Param("search") String search,
            @Param("className") String className,
            @Param("section") String section,
            Pageable pageable);
}