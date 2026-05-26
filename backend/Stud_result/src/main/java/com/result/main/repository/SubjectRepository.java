package com.result.main.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.result.main.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);

    @Query("SELECT s FROM Subject s WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(s.subjectName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.subjectCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Subject> searchSubjects(@Param("search") String search, Pageable pageable);
}