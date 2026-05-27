package com.result.main.repository;

import com.result.main.entity.ExamNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamNotificationRepository extends JpaRepository<ExamNotification, Long> {

    @Query("SELECT n FROM ExamNotification n WHERE n.targetRole IS NULL OR n.targetRole = :role OR n.targetRole = 'ALL' ORDER BY n.createdAt DESC")
    List<ExamNotification> findForRole(@Param("role") String role, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT n FROM ExamNotification n WHERE (n.targetRole = :role OR n.targetRole = 'ALL') AND n.id NOT IN :readIds ORDER BY n.createdAt DESC")
    List<ExamNotification> findUnreadForRole(@Param("role") String role, @Param("readIds") List<Long> readIds);

    @Query("SELECT n FROM ExamNotification n WHERE (n.targetRole = :role OR n.targetRole = 'ALL') ORDER BY n.createdAt DESC")
    List<ExamNotification> findAllForRole(@Param("role") String role);

    List<ExamNotification> findByExamIdOrderByCreatedAtDesc(Long examId);
}
