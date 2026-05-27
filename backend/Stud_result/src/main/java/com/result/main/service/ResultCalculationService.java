package com.result.main.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class ResultCalculationService {

    public double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public String calculateGrade(Integer marksObtained, int maxMarks, int passMarks) {
        if (marksObtained == null) return "F";
        if (marksObtained < passMarks) return "F";
        double pct = maxMarks > 0 ? (marksObtained * 100.0 / maxMarks) : 0;
        return getGradeFromPercentage(pct);
    }

    public String getGradeFromPercentage(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        return "F";
    }

    public double getGpaFromGrade(String grade) {
        if (grade == null) return 0.0;
        return switch (grade.toUpperCase()) {
            case "A+" -> 4.0;
            case "A" -> 3.7;
            case "B+" -> 3.3;
            case "B" -> 3.0;
            case "C" -> 2.5;
            case "D" -> 2.0;
            default -> 0.0;
        };
    }

    public Map<String, Object> calculateOverallStats(List<SubjectScore> scores) {
        int totalObtained = 0;
        int totalMax = 0;
        boolean hasFailed = false;

        for (SubjectScore s : scores) {
            int obtained = s.getMarksObtained() != null ? s.getMarksObtained() : 0;
            int max = s.getMaxMarks() > 0 ? s.getMaxMarks() : 100;
            int pass = s.getPassMarks() > 0 ? s.getPassMarks() : 35;

            totalObtained += obtained;
            totalMax += max;

            if (s.getMarksObtained() == null || s.getMarksObtained() < pass) {
                hasFailed = true;
            }
        }

        double pct = totalMax > 0 ? round2(totalObtained * 100.0 / totalMax) : 0.0;
        String status = hasFailed ? "FAILED" : "PASSED";
        String grade = hasFailed ? "F" : getGradeFromPercentage(pct);
        double gpa = getGpaFromGrade(grade);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalMarks", totalObtained);
        res.put("maxMarks", totalMax);
        res.put("percentage", pct);
        res.put("grade", grade);
        res.put("gpa", gpa);
        res.put("status", status);
        return res;
    }

    public static class SubjectScore {
        private final Integer marksObtained;
        private final int maxMarks;
        private final int passMarks;

        public SubjectScore(Integer marksObtained, int maxMarks, int passMarks) {
            this.marksObtained = marksObtained;
            this.maxMarks = maxMarks;
            this.passMarks = passMarks;
        }

        public Integer getMarksObtained() { return marksObtained; }
        public int getMaxMarks() { return maxMarks; }
        public int getPassMarks() { return passMarks; }
    }
}
