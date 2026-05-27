package com.result.main.repository;

import com.result.main.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamSubjectRepository extends JpaRepository<ExamSubject, Long> {

    List<ExamSubject> findByExamId(Long examId);

    void deleteByExamId(Long examId);

    @Query("SELECT es FROM ExamSubject es WHERE es.teacher.id = :teacherId")
    List<ExamSubject> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT es FROM ExamSubject es WHERE es.exam.id = :examId AND es.teacher.id = :teacherId")
    List<ExamSubject> findByExamIdAndTeacherId(@Param("examId") Long examId, @Param("teacherId") Long teacherId);
}
