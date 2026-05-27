package com.result.main.dto;

public class ExamNotificationRequest {
    private String title;
    private String message;
    private String targetRole;
    private Long examId;

    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getTargetRole() { return targetRole; }
    public Long getExamId() { return examId; }

    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public void setExamId(Long examId) { this.examId = examId; }
}
