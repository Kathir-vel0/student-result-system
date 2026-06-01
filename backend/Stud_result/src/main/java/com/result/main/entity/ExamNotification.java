package com.result.main.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_notifications")
public class ExamNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String targetRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getTargetRole() { return targetRole; }
    public Exam getExam() { return exam; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public void setExam(Exam exam) { this.exam = exam; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
