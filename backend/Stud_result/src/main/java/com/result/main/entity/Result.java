package com.result.main.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "results",
uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id"}))
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer marks;
    
    private String grade;

    private String comments;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public Integer getMarks() {
        return marks;
    }

    public String getGrade() {
        return grade;
    }
    
    public String getComments() {
        return comments;
    }

    public Student getStudent() {
        return student;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }
    
    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }
}