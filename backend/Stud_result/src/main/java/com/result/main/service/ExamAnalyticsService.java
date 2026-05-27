package com.result.main.service;

import com.result.main.entity.*;
import com.result.main.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamAnalyticsService {

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final StudentRepository studentRepository;
    private final ResultCalculationService resultCalculationService;

    public ExamAnalyticsService(
            ExamRepository examRepository,
            ExamResultRepository examResultRepository,
            ExamSubjectRepository examSubjectRepository,
            StudentRepository studentRepository,
            ResultCalculationService resultCalculationService) {
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.examSubjectRepository = examSubjectRepository;
        this.studentRepository = studentRepository;
        this.resultCalculationService = resultCalculationService;
    }

    public Map<String, Object> getAdminAnalytics(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        List<ExamResult> results = examResultRepository.findByExamId(examId);
        List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(examId);

        Map<String, List<ResultCalculationService.SubjectScore>> studentScoresMap = new HashMap<>();
        for (ExamResult r : results) {
            if (r.getMarksObtained() == null) continue;
            String sid = r.getStudent().getStudentId();
            ExamSubject es = examSubjects.stream()
                    .filter(s -> s.getSubject().getId().equals(r.getSubject().getId()))
                    .findFirst().orElse(null);
            int mm = es != null ? es.getTotalMarks() : 100;
            int pm = es != null ? es.getPassMarks() : 35;

            studentScoresMap.computeIfAbsent(sid, k -> new ArrayList<>())
                    .add(new ResultCalculationService.SubjectScore(r.getMarksObtained(), mm, pm));
        }

        int pass = 0, fail = 0;
        for (List<ResultCalculationService.SubjectScore> scores : studentScoresMap.values()) {
            Map<String, Object> stats = resultCalculationService.calculateOverallStats(scores);
            if ("PASSED".equals(stats.get("status"))) {
                pass++;
            } else {
                fail++;
            }
        }
        int graded = pass + fail;

        Map<String, Double> studentTotals = new HashMap<>();
        Map<String, Double> studentMax = new HashMap<>();
        for (ExamResult r : results) {
            if (r.getMarksObtained() == null) continue;
            String sid = r.getStudent().getStudentId();
            ExamSubject es = examSubjects.stream()
                    .filter(s -> s.getSubject().getId().equals(r.getSubject().getId()))
                    .findFirst().orElse(null);
            int mm = es != null ? es.getTotalMarks() : 100;
            studentTotals.merge(sid, (double) r.getMarksObtained(), Double::sum);
            studentMax.merge(sid, (double) mm, Double::sum);
        }

        List<Map<String, Object>> toppers = studentTotals.entrySet().stream()
                .map(e -> {
                    double max = studentMax.getOrDefault(e.getKey(), 100.0);
                    double pct = max > 0 ? round2(e.getValue() * 100.0 / max) : 0;
                    Student s = studentRepository.findByStudentId(e.getKey()).orElse(null);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("studentId", e.getKey());
                    m.put("name", s != null ? s.getName() : e.getKey());
                    m.put("totalMarks", e.getValue().intValue());
                    m.put("percentage", pct);
                    return m;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("percentage"), (Double) a.get("percentage")))
                .limit(5)
                .collect(Collectors.toList());

        List<Map<String, Object>> subjectAverages = examSubjects.stream().map(es -> {
            List<ExamResult> subResults = results.stream()
                    .filter(r -> r.getSubject().getId().equals(es.getSubject().getId()))
                    .filter(r -> r.getMarksObtained() != null)
                    .toList();
            double avg = subResults.stream().mapToInt(ExamResult::getMarksObtained).average().orElse(0);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("subject", es.getSubject().getSubjectName());
            m.put("average", round2(avg));
            m.put("maxMarks", es.getMaxMarks());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("examId", examId);
        data.put("examName", exam.getExamName());
        data.put("passCount", pass);
        data.put("failCount", fail);
        data.put("passPercentage", graded > 0 ? round2(pass * 100.0 / graded) : 0);
        data.put("failPercentage", graded > 0 ? round2(fail * 100.0 / graded) : 0);
        data.put("toppers", toppers);
        data.put("subjectAverages", subjectAverages);
        data.put("passFailPie", List.of(
                Map.of("name", "Pass", "value", pass),
                Map.of("name", "Fail", "value", fail)
        ));
        data.put("totalResults", results.size());
        return data;
    }

    public Map<String, Object> getTeacherAnalytics(Long examId, Long subjectId) {
        List<ExamResult> results = examResultRepository.findByExamIdAndSubjectId(examId, subjectId);
        ExamSubject es = examSubjectRepository.findByExamId(examId).stream()
                .filter(s -> s.getSubject().getId().equals(subjectId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subject not in exam"));

        int maxMarks = es.getTotalMarks();
        int passMarks = es.getPassMarks() != null ? es.getPassMarks() : 35;

        List<Integer> marksList = results.stream()
                .map(ExamResult::getMarksObtained)
                .filter(Objects::nonNull)
                .toList();

        double avg = marksList.stream().mapToInt(Integer::intValue).average().orElse(0);

        List<Map<String, Object>> distribution = List.of(
                bucket("0-35", marksList, 0, 35, maxMarks),
                bucket("36-50", marksList, 36, 50, maxMarks),
                bucket("51-70", marksList, 51, 70, maxMarks),
                bucket("71-85", marksList, 71, 85, maxMarks),
                bucket("86-100", marksList, 86, 100, maxMarks)
        );

        List<Map<String, Object>> weakStudents = results.stream()
                .filter(r -> r.getMarksObtained() != null)
                .filter(r -> {
                    double pct = maxMarks > 0 ? r.getMarksObtained() * 100.0 / maxMarks : 0;
                    double passPct = maxMarks > 0 ? passMarks * 100.0 / maxMarks : 35;
                    return pct < passPct;
                })
                .map(r -> Map.<String, Object>of(
                        "studentId", r.getStudent().getStudentId(),
                        "name", r.getStudent().getName(),
                        "marks", r.getMarksObtained()
                ))
                .limit(10)
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("classAverage", round2(avg));
        data.put("maxMarks", maxMarks);
        data.put("marksDistribution", distribution);
        data.put("weakStudents", weakStudents);
        data.put("totalEntered", marksList.size());
        return data;
    }

    public Map<String, Object> getStudentAnalytics(String studentId) {
        List<ExamResult> results = examResultRepository.findPublishedForStudent(studentId);
        Map<Long, List<ExamResult>> byExam = results.stream()
                .collect(Collectors.groupingBy(r -> r.getExam().getId()));

        List<Map<String, Object>> gpaTrend = new ArrayList<>();
        List<Map<String, Object>> subjectPerf = new ArrayList<>();

        for (Map.Entry<Long, List<ExamResult>> entry : byExam.entrySet()) {
            Exam exam = entry.getValue().get(0).getExam();
            List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(exam.getId());
            List<ResultCalculationService.SubjectScore> scoreList = new ArrayList<>();
            for (ExamResult r : entry.getValue()) {
                ExamSubject es = examSubjects.stream()
                        .filter(s -> s.getSubject().getId().equals(r.getSubject().getId()))
                        .findFirst().orElse(null);
                int mm = es != null ? es.getTotalMarks() : 100;
                int pm = es != null ? es.getPassMarks() : 35;
                scoreList.add(new ResultCalculationService.SubjectScore(r.getMarksObtained(), mm, pm));
            }
            Map<String, Object> stats = resultCalculationService.calculateOverallStats(scoreList);
            gpaTrend.add(Map.of(
                    "exam", exam.getExamName(),
                    "percentage", stats.get("percentage"),
                    "gpa", stats.get("gpa")
            ));
        }

        Map<String, List<Integer>> bySubject = new LinkedHashMap<>();
        for (ExamResult r : results) {
            String name = r.getSubject().getSubjectName();
            if (r.getMarksObtained() != null) {
                bySubject.computeIfAbsent(name, k -> new ArrayList<>()).add(r.getMarksObtained());
            }
        }
        for (Map.Entry<String, List<Integer>> e : bySubject.entrySet()) {
            double avg = e.getValue().stream().mapToInt(Integer::intValue).average().orElse(0);
            subjectPerf.add(Map.of("subject", e.getKey(), "average", round2(avg)));
        }

        Map<String, Double> examPct = new LinkedHashMap<>();
        for (Map.Entry<Long, List<ExamResult>> entry : byExam.entrySet()) {
            List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(entry.getKey());
            List<ResultCalculationService.SubjectScore> scoreList = new ArrayList<>();
            for (ExamResult r : entry.getValue()) {
                ExamSubject es = examSubjects.stream()
                        .filter(s -> s.getSubject().getId().equals(r.getSubject().getId()))
                        .findFirst().orElse(null);
                int mm = es != null ? es.getTotalMarks() : 100;
                int pm = es != null ? es.getPassMarks() : 35;
                scoreList.add(new ResultCalculationService.SubjectScore(r.getMarksObtained(), mm, pm));
            }
            Map<String, Object> stats = resultCalculationService.calculateOverallStats(scoreList);
            examPct.put(entry.getValue().get(0).getExam().getExamName(), (Double) stats.get("percentage"));
        }
        int rank = computeRank(studentId, examPct);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("gpaTrend", gpaTrend);
        data.put("subjectPerformance", subjectPerf);
        data.put("rank", rank);
        data.put("totalExams", byExam.size());
        return data;
    }

    private int computeRank(String studentId, Map<String, Double> studentPctByExam) {
        if (studentPctByExam.isEmpty()) return 0;
        double myAvg = studentPctByExam.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);

        // Fetch all published results and exam subjects in one go (2 queries instead of N+1 database statements)
        List<ExamResult> allResults = examResultRepository.findAllPublishedResults();
        List<ExamSubject> allSubjects = examSubjectRepository.findAll();

        // Group subjects by exam ID and subject ID for O(1) in-memory lookup
        Map<Long, Map<Long, ExamSubject>> subjectsLookup = allSubjects.stream()
                .filter(es -> es.getExam() != null && es.getSubject() != null)
                .collect(Collectors.groupingBy(
                        es -> es.getExam().getId(),
                        Collectors.toMap(es -> es.getSubject().getId(), es -> es, (a, b) -> a)
                ));

        // Group results by student studentId
        Map<String, List<ExamResult>> resultsByStudent = allResults.stream()
                .filter(er -> er.getStudent() != null)
                .collect(Collectors.groupingBy(er -> er.getStudent().getStudentId()));

        long better = 0;
        for (Map.Entry<String, List<ExamResult>> entry : resultsByStudent.entrySet()) {
            String sid = entry.getKey();
            if (sid.equals(studentId)) continue; // Skip current student

            List<ExamResult> studentResults = entry.getValue();
            if (studentResults.isEmpty()) continue;

            // Group student's results by exam ID
            Map<Long, List<ExamResult>> byExam = studentResults.stream()
                    .filter(er -> er.getExam() != null)
                    .collect(Collectors.groupingBy(er -> er.getExam().getId()));

            double avg = byExam.entrySet().stream().mapToDouble(examEntry -> {
                Long examId = examEntry.getKey();
                int totalMarks = 0;
                int maxMarks = 0;
                
                Map<Long, ExamSubject> examSubjects = subjectsLookup.get(examId);
                for (ExamResult er : examEntry.getValue()) {
                    if (er.getSubject() == null) continue;
                    ExamSubject es = examSubjects != null ? examSubjects.get(er.getSubject().getId()) : null;
                    int mm = es != null ? es.getTotalMarks() : 100;
                    totalMarks += er.getMarksObtained() != null ? er.getMarksObtained() : 0;
                    maxMarks += mm;
                }
                return maxMarks > 0 ? totalMarks * 100.0 / maxMarks : 0;
            }).average().orElse(0);

            if (avg > myAvg) {
                better++;
            }
        }

        return (int) better + 1;
    }

    private Map<String, Object> bucket(String label, List<Integer> marks, int low, int high, int maxMarks) {
        long count = marks.stream()
                .filter(m -> {
                    double pct = maxMarks > 0 ? m * 100.0 / maxMarks : 0;
                    double lowPct = maxMarks > 0 ? low * 100.0 / maxMarks : low;
                    double highPct = maxMarks > 0 ? high * 100.0 / maxMarks : high;
                    return pct >= lowPct && pct <= highPct;
                })
                .count();
        return Map.of("range", label, "count", count);
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
