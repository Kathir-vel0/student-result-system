package com.result.main.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results",
        uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id", "student_id", "subject_id"}))
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private Integer marksObtained;

    private String grade;

    private String remarks;

    private String enteredBy;

    private boolean published = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public Exam getExam() { return exam; }
    public Student getStudent() { return student; }
    public Subject getSubject() { return subject; }
    public Integer getMarksObtained() { return marksObtained; }
    public String getGrade() { return grade; }
    public String getRemarks() { return remarks; }
    public String getEnteredBy() { return enteredBy; }
    public boolean isPublished() { return published; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setExam(Exam exam) { this.exam = exam; }
    public void setStudent(Student student) { this.student = student; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
    public void setGrade(String grade) { this.grade = grade; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public void setEnteredBy(String enteredBy) { this.enteredBy = enteredBy; }
    public void setPublished(boolean published) { this.published = published; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
