package com.result.main.repository;

import com.result.main.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByExamId(Long examId);

    List<ExamResult> findByExamIdAndPublishedTrue(Long examId);

    List<ExamResult> findByStudentStudentIdAndExamPublishedTrue(String studentId);

    List<ExamResult> findByStudentStudentIdAndExamIdAndPublishedTrue(String studentId, Long examId);

    Optional<ExamResult> findByExamIdAndStudentIdAndSubjectId(Long examId, Long studentId, Long subjectId);

    @Query("SELECT er FROM ExamResult er WHERE er.exam.id = :examId AND er.subject.id = :subjectId")
    List<ExamResult> findByExamIdAndSubjectId(@Param("examId") Long examId, @Param("subjectId") Long subjectId);

    long countByExamIdAndPublishedFalse(Long examId);

    @Query("SELECT er FROM ExamResult er JOIN er.exam e WHERE er.student.studentId = :studentId " +
           "AND e.published = true AND er.published = true")
    List<ExamResult> findPublishedForStudent(@Param("studentId") String studentId);

    @Query("SELECT er FROM ExamResult er JOIN er.exam e WHERE e.published = true AND er.published = true")
    List<ExamResult> findAllPublishedResults();

    @Query("SELECT er FROM ExamResult er " +
           "JOIN FETCH er.student s " +
           "JOIN FETCH er.subject sub " +
           "JOIN FETCH er.exam e " +
           "WHERE s.className = :className AND e.id = :examId AND er.published = true")
    List<ExamResult> findPublishedByClassAndExam(@Param("className") String className, @Param("examId") Long examId);
}
