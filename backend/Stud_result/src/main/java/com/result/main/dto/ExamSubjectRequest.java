package com.result.main.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ExamSubjectRequest {
    private Long subjectId;
    private Long teacherId;
    private LocalDate examDate;
    private String startTime;
    private String endTime;
    private Integer maxMarks;
    private Integer totalMarks;
    private Integer passMarks;
    private String roomNumber;

    public Long getSubjectId() { return subjectId; }
    public Long getTeacherId() { return teacherId; }
    public LocalDate getExamDate() { return examDate; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public Integer getMaxMarks() { return maxMarks; }
    public Integer getTotalMarks() { return totalMarks != null ? totalMarks : maxMarks; }
    public Integer getPassMarks() { return passMarks; }
    public String getRoomNumber() { return roomNumber; }

    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
        if (this.totalMarks == null) {
            this.totalMarks = maxMarks;
        }
    }
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
        this.maxMarks = totalMarks;
    }
    public void setPassMarks(Integer passMarks) { this.passMarks = passMarks; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
