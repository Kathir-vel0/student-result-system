package com.result.main.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.result.main.entity.Result;
import com.result.main.entity.Student;
import com.result.main.entity.Subject;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {
	 List<Result> findByStudentStudentId(String studentId);
	 List<Result> findByStudentStudentIdAndPublishedTrue(String studentId);

	 Optional<Result> findByStudentAndSubject(Student student, Subject subject);

	 @Query("SELECT r FROM Result r JOIN r.student s JOIN r.subject sub WHERE " +
	        "(:search IS NULL OR :search = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
	        "OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
	        "(:className IS NULL OR :className = '' OR s.className = :className) AND " +
	        "(:subjectCode IS NULL OR :subjectCode = '' OR sub.subjectCode = :subjectCode) AND " +
	        "(:minMarks IS NULL OR r.marks >= :minMarks) AND " +
	        "(:maxMarks IS NULL OR r.marks <= :maxMarks)")
	 Page<Result> searchResults(
	         @Param("search") String search,
	         @Param("className") String className,
	         @Param("subjectCode") String subjectCode,
	         @Param("minMarks") Integer minMarks,
	         @Param("maxMarks") Integer maxMarks,
	         Pageable pageable);
}