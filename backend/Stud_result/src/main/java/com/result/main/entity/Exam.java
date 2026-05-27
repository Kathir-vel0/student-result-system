package com.result.main.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String examName;

    private String examType;

    private String className;

    private String section;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamStatus status = ExamStatus.DRAFT;

    private String createdBy;

    private boolean published = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamSubject> subjects = new ArrayList<>();

    public Long getId() { return id; }
    public String getExamName() { return examName; }
    public String getExamType() { return examType; }
    public String getClassName() { return className; }
    public String getSection() { return section; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public ExamStatus getStatus() { return status; }
    public String getCreatedBy() { return createdBy; }
    public boolean isPublished() { return published; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<ExamSubject> getSubjects() { return subjects; }

    public void setId(Long id) { this.id = id; }
    public void setExamName(String examName) { this.examName = examName; }
    public void setExamType(String examType) { this.examType = examType; }
    public void setClassName(String className) { this.className = className; }
    public void setSection(String section) { this.section = section; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public void setStatus(ExamStatus status) { this.status = status; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setPublished(boolean published) { this.published = published; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setSubjects(List<ExamSubject> subjects) { this.subjects = subjects; }
}
