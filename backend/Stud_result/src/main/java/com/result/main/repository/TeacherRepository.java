package com.result.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.result.main.entity.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
}