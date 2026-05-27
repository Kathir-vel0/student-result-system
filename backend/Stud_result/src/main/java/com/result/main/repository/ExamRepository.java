package com.result.main.repository;

import com.result.main.entity.Exam;
import com.result.main.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    @Query("SELECT e FROM Exam e WHERE " +
           "(:search IS NULL OR LOWER(e.examName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.examType) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:className IS NULL OR e.className = :className) AND " +
           "(:section IS NULL OR e.section = :section) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:fromDate IS NULL OR e.startDate >= :fromDate) AND " +
           "(:toDate IS NULL OR e.endDate <= :toDate)")
    Page<Exam> searchExams(
            @Param("search") String search,
            @Param("className") String className,
            @Param("section") String section,
            @Param("status") ExamStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    List<Exam> findByClassNameAndSection(String className, String section);

    List<Exam> findByStatus(ExamStatus status);
}
