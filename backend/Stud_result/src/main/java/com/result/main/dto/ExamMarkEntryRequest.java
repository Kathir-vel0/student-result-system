package com.result.main.dto;

import java.util.List;

public class ExamMarkEntryRequest {
    private Long examId;
    private Long subjectId;
    private List<MarkRow> marks;

    public Long getExamId() { return examId; }
    public Long getSubjectId() { return subjectId; }
    public List<MarkRow> getMarks() { return marks; }

    public void setExamId(Long examId) { this.examId = examId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public void setMarks(List<MarkRow> marks) { this.marks = marks; }

    public static class MarkRow {
        private String studentId;
        private Integer marksObtained;
        private String remarks;

        public String getStudentId() { return studentId; }
        public Integer getMarksObtained() { return marksObtained; }
        public String getRemarks() { return remarks; }

        public void setStudentId(String studentId) { this.studentId = studentId; }
        public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
