package com.result.main.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exam_subjects")
public class ExamSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnore
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    private LocalDate examDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer maxMarks;

    private Integer passMarks;

    private String roomNumber;

    public Long getId() { return id; }
    public Exam getExam() { return exam; }
    public Subject getSubject() { return subject; }
    public Teacher getTeacher() { return teacher; }
    public LocalDate getExamDate() { return examDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public Integer getMaxMarks() { return maxMarks; }
    public Integer getPassMarks() { return passMarks; }
    public String getRoomNumber() { return roomNumber; }

    public void setId(Long id) { this.id = id; }
    public void setExam(Exam exam) { this.exam = exam; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    public void setPassMarks(Integer passMarks) { this.passMarks = passMarks; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
