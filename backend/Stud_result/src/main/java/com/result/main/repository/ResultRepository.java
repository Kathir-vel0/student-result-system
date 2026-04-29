package com.result.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.result.main.entity.Result;
import com.result.main.entity.Student;
import com.result.main.entity.Subject;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {
	 List<Result> findByStudentStudentId(String studentId);

	 Optional<Result> findByStudentAndSubject(Student student, Subject subject);
}