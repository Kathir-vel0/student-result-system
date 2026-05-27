package com.result.main.dto;

import java.time.LocalDate;
import java.util.List;

public class ExamRequest {
    private String examName;
    private String examType;
    private String className;
    private String section;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private List<ExamSubjectRequest> subjects;

    public String getExamName() { return examName; }
    public String getExamType() { return examType; }
    public String getClassName() { return className; }
    public String getSection() { return section; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getStatus() { return status; }
    public List<ExamSubjectRequest> getSubjects() { return subjects; }

    public void setExamName(String examName) { this.examName = examName; }
    public void setExamType(String examType) { this.examType = examType; }
    public void setClassName(String className) { this.className = className; }
    public void setSection(String section) { this.section = section; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public void setStatus(String status) { this.status = status; }
    public void setSubjects(List<ExamSubjectRequest> subjects) { this.subjects = subjects; }
}
