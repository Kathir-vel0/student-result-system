package com.result.main.service;

import com.result.main.entity.Result;
import com.result.main.entity.Student;
import com.result.main.entity.Teacher;
import com.result.main.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final ResultRepository resultRepository;
    private final AttendanceRepository attendanceRepository;
    private final AuditLogRepository auditLogRepository;
    private final ExamResultRepository examResultRepository;

    public AnalyticsService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            SubjectRepository subjectRepository,
            ResultRepository resultRepository,
            AttendanceRepository attendanceRepository,
            AuditLogRepository auditLogRepository,
            ExamResultRepository examResultRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.resultRepository = resultRepository;
        this.attendanceRepository = attendanceRepository;
        this.auditLogRepository = auditLogRepository;
        this.examResultRepository = examResultRepository;
    }

    public Map<String, Object> getAdminAnalytics() {
        List<Result> allResults = resultRepository.findAll();
        List<Student> students = studentRepository.findAll();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", students.size());
        stats.put("totalTeachers", teacherRepository.count());
        stats.put("totalSubjects", subjectRepository.count());
        stats.put("totalResults", allResults.size());

        int passCount = 0;
        int failCount = 0;
        double marksSum = 0;
        int marksCount = 0;

        for (Result r : allResults) {
            if (r.getMarks() == null) continue;
            marksSum += r.getMarks();
            marksCount++;
            if (isPass(r.getMarks())) passCount++;
            else failCount++;
        }

        int graded = passCount + failCount;
        stats.put("passPercentage", graded > 0 ? round2(passCount * 100.0 / graded) : 0);
        stats.put("failPercentage", graded > 0 ? round2(failCount * 100.0 / graded) : 0);
        stats.put("averagePerformance", marksCount > 0 ? round2(marksSum / marksCount) : 0);

        stats.put("subjectPerformance", buildSubjectPerformance(allResults));
        stats.put("studentGrowth", buildStudentGrowth(students));
        stats.put("passFailPie", List.of(
                Map.of("name", "Pass", "value", passCount),
                Map.of("name", "Fail", "value", failCount)
        ));
        stats.put("classAnalytics", buildClassAnalytics(allResults, students));
        stats.put("recentActivities", buildRecentActivities(8));

        return stats;
    }

    public Map<String, Object> getTeacherAnalytics(String username) {
        Map<String, Object> stats = new LinkedHashMap<>();
        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && username.equals(t.getUser().getUsername()))
                .findFirst()
                .orElse(null);

        int assignedSubjects = (teacher != null && teacher.getSubject() != null) ? 1 : 0;
        stats.put("assignedSubjects", assignedSubjects);
        stats.put("totalStudents", studentRepository.count());

        List<Result> allResults = resultRepository.findAll();
        String subjectCode = teacher != null && teacher.getSubject() != null
                ? teacher.getSubject().getSubjectCode() : null;

        List<Result> teacherResults = subjectCode == null ? List.of() :
                allResults.stream()
                        .filter(r -> r.getSubject() != null && subjectCode.equals(r.getSubject().getSubjectCode()))
                        .collect(Collectors.toList());

        stats.put("marksSubmitted", teacherResults.size());
        stats.put("attendancePercentage", computeGlobalAttendancePercent());
        stats.put("subjectPerformance", buildSubjectPerformance(teacherResults));
        stats.put("marksDistribution", buildMarksDistribution(teacherResults));
        stats.put("topPerformers", buildTopPerformers(teacherResults, 5));
        stats.put("subjectAverages", buildSubjectPerformance(teacherResults));

        return stats;
    }

    public Map<String, Object> getStudentAnalytics(String studentId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<com.result.main.entity.ExamResult> results = examResultRepository.findPublishedForStudent(studentId);

        double totalMarks = 0;
        int count = 0;
        for (com.result.main.entity.ExamResult r : results) {
            if (r.getMarksObtained() != null) {
                totalMarks += r.getMarksObtained();
                count++;
            }
        }

        double percentage = count > 0 ? round2(totalMarks / count) : 0;
        stats.put("gpaPercentage", percentage);
        stats.put("attendancePercentage", computeStudentAttendancePercent(student.getId()));
        stats.put("rank", computeRank(studentId, percentage));
        stats.put("subjectMarks", results.stream()
                .map(r -> Map.of(
                        "subject", r.getSubject() != null ? r.getSubject().getSubjectName() : "N/A",
                        "subjectCode", r.getSubject() != null ? r.getSubject().getSubjectCode() : "",
                        "marks", r.getMarksObtained() != null ? r.getMarksObtained() : 0,
                        "grade", r.getGrade() != null ? r.getGrade() : ""
                ))
                .collect(Collectors.toList()));
        stats.put("performanceTrend", results.stream()
                .map(r -> Map.<String, Object>of(
                        "subject", r.getSubject() != null ? r.getSubject().getSubjectName() : "N/A",
                        "marks", r.getMarksObtained() != null ? r.getMarksObtained() : 0
                ))
                .collect(Collectors.toList()));
        stats.put("totalSubjects", count);

        return stats;
    }

    public Map<String, Object> getReportCardData(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<com.result.main.entity.ExamResult> results = examResultRepository.findPublishedForStudent(studentId);
        List<Map<String, Object>> subjects = new ArrayList<>();
        int totalMarks = 0;
        int maxMarks = results.size() * 100;

        for (com.result.main.entity.ExamResult r : results) {
            int marks = r.getMarksObtained() != null ? r.getMarksObtained() : 0;
            totalMarks += marks;
            subjects.add(Map.of(
                    "subjectCode", r.getSubject() != null ? r.getSubject().getSubjectCode() : "",
                    "subjectName", r.getSubject() != null ? r.getSubject().getSubjectName() : "",
                    "marks", marks,
                    "grade", r.getGrade() != null ? r.getGrade() : "",
                    "comments", r.getRemarks() != null ? r.getRemarks() : ""
            ));
        }

        double percentage = maxMarks > 0 ? round2(totalMarks * 100.0 / maxMarks) : 0;
        double avgMarks = results.isEmpty() ? 0 : round2((double) totalMarks / results.size());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("studentId", student.getStudentId());
        data.put("name", student.getName());
        data.put("className", student.getClassName());
        data.put("section", student.getSection());
        data.put("email", student.getEmail());
        data.put("subjects", subjects);
        data.put("totalMarks", totalMarks);
        data.put("maxMarks", maxMarks);
        data.put("percentage", percentage);
        data.put("averageMarks", avgMarks);
        data.put("grade", overallGrade(avgMarks));
        data.put("rank", computeRank(studentId, percentage));
        data.put("attendancePercentage", computeStudentAttendancePercent(student.getId()));
        data.put("remarks", results.stream()
                .map(com.result.main.entity.ExamResult::getRemarks)
                .filter(c -> c != null && !c.isBlank())
                .findFirst()
                .orElse("Keep up the good work."));
        data.put("generatedAt", LocalDate.now().toString());

        return data;
    }

    private List<Map<String, Object>> buildSubjectPerformance(List<Result> results) {
        Map<String, List<Integer>> bySubject = new LinkedHashMap<>();
        for (Result r : results) {
            if (r.getSubject() == null || r.getMarks() == null) continue;
            String name = r.getSubject().getSubjectName();
            bySubject.computeIfAbsent(name, k -> new ArrayList<>()).add(r.getMarks());
        }
        return bySubject.entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream().mapToInt(Integer::intValue).average().orElse(0);
                    return Map.<String, Object>of("subject", e.getKey(), "average", round2(avg));
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildStudentGrowth(List<Student> students) {
        Map<YearMonth, Long> counts = new TreeMap<>();
        for (Student s : students) {
            if (s.getUser() != null && s.getUser().getCreatedAt() != null) {
                YearMonth ym = YearMonth.from(s.getUser().getCreatedAt());
                counts.merge(ym, 1L, Long::sum);
            }
        }
        if (counts.isEmpty()) {
            YearMonth now = YearMonth.now();
            counts.put(now, (long) students.size());
        }
        long cumulative = 0;
        List<Map<String, Object>> growth = new ArrayList<>();
        for (Map.Entry<YearMonth, Long> e : counts.entrySet()) {
            cumulative += e.getValue();
            growth.add(Map.of("month", e.getKey().toString(), "count", cumulative));
        }
        return growth;
    }

    private List<Map<String, Object>> buildClassAnalytics(List<Result> results, List<Student> students) {
        Map<String, List<Integer>> classMarks = new LinkedHashMap<>();
        Map<String, Student> studentById = students.stream()
                .collect(Collectors.toMap(Student::getStudentId, s -> s, (a, b) -> a));

        for (Result r : results) {
            if (r.getStudent() == null || r.getMarks() == null) continue;
            String className = r.getStudent().getClassName();
            if (className == null) continue;
            classMarks.computeIfAbsent(className, k -> new ArrayList<>()).add(r.getMarks());
        }

        return classMarks.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "className", e.getKey(),
                        "average", round2(e.getValue().stream().mapToInt(Integer::intValue).average().orElse(0)),
                        "students", studentById.values().stream().filter(s -> e.getKey().equals(s.getClassName())).count()
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildRecentActivities(int limit) {
        return auditLogRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, limit,
                        org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"))
        ).getContent().stream()
                .map(a -> Map.<String, Object>of(
                        "action", a.getAction(),
                        "performedBy", a.getPerformedBy(),
                        "role", a.getRole(),
                        "description", a.getDescription() != null ? a.getDescription() : "",
                        "timestamp", a.getTimestamp() != null ? a.getTimestamp().toString() : ""
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildMarksDistribution(List<Result> results) {
        int[] buckets = new int[5];
        String[] labels = {"0-39", "40-49", "50-59", "60-79", "80-100"};
        for (Result r : results) {
            if (r.getMarks() == null) continue;
            int m = r.getMarks();
            if (m < 40) buckets[0]++;
            else if (m < 50) buckets[1]++;
            else if (m < 60) buckets[2]++;
            else if (m < 80) buckets[3]++;
            else buckets[4]++;
        }
        List<Map<String, Object>> dist = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            dist.add(Map.of("range", labels[i], "count", buckets[i]));
        }
        return dist;
    }

    private List<Map<String, Object>> buildTopPerformers(List<Result> results, int limit) {
        Map<String, Integer> bestByStudent = new HashMap<>();
        Map<String, String> names = new HashMap<>();
        for (Result r : results) {
            if (r.getStudent() == null || r.getMarks() == null) continue;
            String sid = r.getStudent().getStudentId();
            names.put(sid, r.getStudent().getName());
            bestByStudent.merge(sid, r.getMarks(), Math::max);
        }
        return bestByStudent.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(e -> Map.<String, Object>of(
                        "studentId", e.getKey(),
                        "name", names.getOrDefault(e.getKey(), e.getKey()),
                        "marks", e.getValue()
                ))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildPerformanceTrend(List<Result> results) {
        return results.stream()
                .map(r -> Map.<String, Object>of(
                        "subject", r.getSubject() != null ? r.getSubject().getSubjectName() : "N/A",
                        "marks", r.getMarks() != null ? r.getMarks() : 0
                ))
                .collect(Collectors.toList());
    }

    private int computeRank(String studentId, double percentage) {
        List<Student> all = studentRepository.findAll();
        List<Double> averages = new ArrayList<>();
        for (Student s : all) {
            List<com.result.main.entity.ExamResult> res = examResultRepository.findPublishedForStudent(s.getStudentId());
            double sum = res.stream().filter(r -> r.getMarksObtained() != null).mapToInt(com.result.main.entity.ExamResult::getMarksObtained).sum();
            long cnt = res.stream().filter(r -> r.getMarksObtained() != null).count();
            averages.add(cnt > 0 ? sum / cnt : 0.0);
        }
        averages.sort(Collections.reverseOrder());
        double target = percentage;
        for (int i = 0; i < averages.size(); i++) {
            if (Math.abs(averages.get(i) - target) < 0.01) return i + 1;
        }
        return averages.size();
    }

    private double computeStudentAttendancePercent(Long studentId) {
        long total = attendanceRepository.countByStudentId(studentId);
        if (total == 0) return 0;
        long present = attendanceRepository.countPresentByStudentId(studentId);
        return round2(present * 100.0 / total);
    }

    private double computeGlobalAttendancePercent() {
        long total = attendanceRepository.count();
        if (total == 0) return 0;
        long present = attendanceRepository.findAll().stream()
                .filter(a -> a.getStatus() == com.result.main.entity.AttendanceStatus.PRESENT
                        || a.getStatus() == com.result.main.entity.AttendanceStatus.LATE)
                .count();
        return round2(present * 100.0 / total);
    }

    private boolean isPass(int marks) {
        return marks >= 50;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private String overallGrade(double avg) {
        if (avg >= 90) return "A+";
        if (avg >= 80) return "A";
        if (avg >= 70) return "B";
        if (avg >= 60) return "C";
        if (avg >= 50) return "D";
        return "F";
    }
}
