package com.result.main.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.result.main.entity.Teacher;
import com.result.main.entity.User;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    Optional<Teacher> findByUser(User user);

    @Query("SELECT t FROM Teacher t WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.user.username) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Teacher> searchTeachers(@Param("search") String search, Pageable pageable);
}