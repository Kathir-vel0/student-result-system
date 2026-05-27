package com.result.main.service;

import com.result.main.dto.*;
import com.result.main.entity.*;
import com.result.main.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final ExamResultRepository examResultRepository;
    private final ExamNotificationRepository notificationRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ResultCalculationService resultCalculationService;

    public ExamService(
            ExamRepository examRepository,
            ExamSubjectRepository examSubjectRepository,
            ExamResultRepository examResultRepository,
            ExamNotificationRepository notificationRepository,
            SubjectRepository subjectRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            AuditService auditService,
            ResultCalculationService resultCalculationService) {
        this.examRepository = examRepository;
        this.examSubjectRepository = examSubjectRepository;
        this.examResultRepository = examResultRepository;
        this.notificationRepository = notificationRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.resultCalculationService = resultCalculationService;
    }

    public PageResponse<Map<String, Object>> searchExams(
            String search, String className, String section, String status,
            LocalDate fromDate, LocalDate toDate, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        ExamStatus examStatus = parseStatus(status);
        Page<Exam> result = examRepository.searchExams(
                emptyToNull(search), emptyToNull(className), emptyToNull(section),
                examStatus, fromDate, toDate,
                PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Map<String, Object>> content = result.getContent().stream()
                .map(this::toExamSummary)
                .collect(Collectors.toList());
        return new PageResponse<>(content, page, safeSize, result.getTotalElements());
    }

    public Map<String, Object> getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return toExamDetail(exam);
    }

    @Transactional
    public Map<String, Object> createExam(ExamRequest request, String username, String role) {
        Exam exam = new Exam();
        applyExamFields(exam, request);
        exam.setCreatedBy(username);
        exam.setStatus(ExamStatus.DRAFT);
        exam.setPublished(false);
        Exam saved = examRepository.save(exam);
        if (request.getSubjects() != null) {
            saveExamSubjects(saved, request.getSubjects());
        }
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_CREATED", username, role, "Exam",
                "Created exam: " + saved.getExamName(), ipAddress);
        notify("Exam Created", "New exam '" + saved.getExamName() + "' has been created.", "TEACHER", saved);
        return toExamDetail(examRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public Map<String, Object> updateExam(Long id, ExamRequest request, String username, String role) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        applyExamFields(exam, request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            exam.setStatus(ExamStatus.valueOf(request.getStatus().toUpperCase()));
        }
        examRepository.save(exam);
        if (request.getSubjects() != null) {
            examSubjectRepository.deleteByExamId(id);
            saveExamSubjects(exam, request.getSubjects());
        }
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_UPDATED", username, role, "Exam",
                "Updated exam: " + exam.getExamName(), ipAddress);
        notify("Exam Updated", "Exam '" + exam.getExamName() + "' has been updated.", "ALL", exam);
        return toExamDetail(examRepository.findById(id).orElse(exam));
    }

    @Transactional
    public void deleteExam(Long id, String username, String role) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        examRepository.delete(exam);
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_DELETED", username, role, "Exam",
                "Deleted exam: " + exam.getExamName(), ipAddress);
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, String status, String username, String role) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        ExamStatus newStatus = ExamStatus.valueOf(status.toUpperCase());
        exam.setStatus(newStatus);
        examRepository.save(exam);
        String msg = switch (newStatus) {
            case SCHEDULED -> "Exam '" + exam.getExamName() + "' has been scheduled.";
            case ONGOING -> "Exam '" + exam.getExamName() + "' is now ongoing.";
            case COMPLETED -> "Exam '" + exam.getExamName() + "' has been completed.";
            case PUBLISHED -> "Results for '" + exam.getExamName() + "' are published.";
            default -> "Exam status updated.";
        };
        notify("Exam Status: " + newStatus, msg, "ALL", exam);
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_STATUS_CHANGED", username, role, "Exam", msg, ipAddress);
        return toExamSummary(exam);
    }

    @Transactional
    public List<Map<String, Object>> saveMarks(ExamMarkEntryRequest request, String username, String role, Long teacherUserId) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if (exam.isPublished()) {
            throw new RuntimeException("Cannot edit marks after results are published");
        }
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if ("TEACHER".equals(role) && teacherUserId != null) {
            verifyTeacherAssignment(exam.getId(), teacherUserId, subject.getId());
        }

        ExamSubject examSubject = examSubjectRepository.findByExamId(exam.getId()).stream()
                .filter(es -> es.getSubject().getId().equals(subject.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subject not part of this exam"));

        int passMarks = examSubject.getPassMarks() != null ? examSubject.getPassMarks() : 35;
        int maxMarks = examSubject.getMaxMarks() != null ? examSubject.getMaxMarks() : 100;

        List<Map<String, Object>> saved = new ArrayList<>();
        for (ExamMarkEntryRequest.MarkRow row : request.getMarks()) {
            if (row.getStudentId() == null) continue;
            Student student = studentRepository.findByStudentId(row.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + row.getStudentId()));

            ExamResult result = examResultRepository
                    .findByExamIdAndStudentIdAndSubjectId(exam.getId(), student.getId(), subject.getId())
                    .orElse(new ExamResult());

            result.setExam(exam);
            result.setStudent(student);
            result.setSubject(subject);
            result.setMarksObtained(row.getMarksObtained());
            result.setGrade(calculateGrade(row.getMarksObtained(), maxMarks, passMarks));
            result.setRemarks(row.getRemarks());
            result.setEnteredBy(username);
            result.setPublished(false);

            examResultRepository.save(result);
            saved.add(Map.of(
                    "studentId", student.getStudentId(),
                    "marksObtained", row.getMarksObtained() != null ? row.getMarksObtained() : 0,
                    "grade", result.getGrade() != null ? result.getGrade() : ""
            ));
        }
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_MARKS_SAVED", username, role, "ExamResult",
                "Saved marks for exam " + exam.getExamName() + " subject " + subject.getSubjectCode(), ipAddress);
        return saved;
    }

    @Transactional
    public void submitForReview(Long examId, String username, String role, Long teacherUserId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if (teacherUserId != null && "TEACHER".equals(role)) {
            List<ExamSubject> assigned = examSubjectRepository.findByExamIdAndTeacherId(examId,
                    teacherRepository.findByUser(userRepository.findByUsername(username).orElseThrow())
                            .map(Teacher::getId).orElse(-1L));
            if (assigned.isEmpty()) {
                throw new RuntimeException("You are not assigned to this exam");
            }
        }
        exam.setStatus(ExamStatus.COMPLETED);
        examRepository.save(exam);
        notify("Marks Submitted for Review",
                "Teacher submitted marks for '" + exam.getExamName() + "' for admin review.",
                "ADMIN", exam);
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_MARKS_SUBMITTED", username, role, "Exam",
                "Submitted marks for review: " + exam.getExamName(), ipAddress);
    }

    @Transactional
    public Map<String, Object> publishResults(Long examId, String username, String role) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        List<ExamResult> results = examResultRepository.findByExamId(examId);
        for (ExamResult r : results) {
            r.setPublished(true);
            examResultRepository.save(r);
        }
        exam.setPublished(true);
        exam.setStatus(ExamStatus.PUBLISHED);
        examRepository.save(exam);
        notify("Results Published",
                "Results for '" + exam.getExamName() + "' are now available.",
                "STUDENT", exam);
        String ipAddress = auditService.resolveClientIp();
        auditService.log("EXAM_RESULTS_PUBLISHED", username, role, "Exam",
                "Published results for: " + exam.getExamName(), ipAddress);
        return toExamSummary(exam);
    }

    public List<Map<String, Object>> getMarksForEntry(Long examId, Long subjectId, boolean includeUnpublished) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        List<Student> students = studentRepository.searchStudents(
                null, exam.getClassName(), exam.getSection(),
                PageRequest.of(0, 500)).getContent();

        List<ExamResult> existing = examResultRepository.findByExamIdAndSubjectId(examId, subjectId);
        Map<Long, ExamResult> byStudent = existing.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r, (a, b) -> a));

        return students.stream().map(s -> {
            ExamResult er = byStudent.get(s.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId", s.getStudentId());
            row.put("name", s.getName());
            row.put("className", s.getClassName());
            row.put("section", s.getSection());
            if (er != null && (includeUnpublished || er.isPublished())) {
                row.put("marksObtained", er.getMarksObtained());
                row.put("grade", er.getGrade());
                row.put("remarks", er.getRemarks());
                row.put("published", er.isPublished());
            } else {
                row.put("marksObtained", null);
                row.put("grade", null);
                row.put("remarks", null);
                row.put("published", false);
            }
            return row;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentPublishedResults(String studentId) {
        return examResultRepository.findPublishedForStudent(studentId).stream()
                .map(this::toResultMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentExamResults(String studentId, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if (!exam.isPublished()) {
            throw new RuntimeException("Results not yet published");
        }
        return examResultRepository.findByStudentStudentIdAndExamIdAndPublishedTrue(studentId, examId)
                .stream().map(this::toResultMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTimetable(String className, String section, Long teacherId, Long examId) {
        List<ExamSubject> subjects;
        if (examId != null) {
            subjects = examSubjectRepository.findByExamId(examId);
        } else if (teacherId != null) {
            subjects = examSubjectRepository.findByTeacherId(teacherId);
        } else {
            subjects = examSubjectRepository.findAll().stream()
                    .filter(es -> {
                        Exam e = es.getExam();
                        if (className != null && !className.isEmpty() && !className.equals(e.getClassName())) return false;
                        if (section != null && !section.isEmpty() && !section.equals(e.getSection())) return false;
                        return e.getStatus() != ExamStatus.DRAFT;
                    })
                    .collect(Collectors.toList());
        }
        return subjects.stream().map(this::toTimetableEntry).sorted(
                Comparator.comparing((Map<String, Object> m) -> (String) m.getOrDefault("examDate", ""))
                        .thenComparing(m -> (String) m.getOrDefault("startTime", ""))
        ).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTeacherExams(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Set<Long> examIds = examSubjectRepository.findByTeacherId(teacher.getId()).stream()
                .map(es -> es.getExam().getId())
                .collect(Collectors.toSet());
        return examIds.stream()
                .map(examRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(this::toExamSummary)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentExams(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<Exam> currentExams = examRepository.findByClassNameAndSection(student.getClassName(), student.getSection());

        List<com.result.main.entity.ExamResult> publishedResults = examResultRepository.findPublishedForStudent(studentId);
        List<Exam> resultExams = publishedResults.stream()
                .map(com.result.main.entity.ExamResult::getExam)
                .collect(Collectors.toList());

        Set<Exam> allExams = new LinkedHashSet<>(currentExams);
        allExams.addAll(resultExams);

        return allExams.stream()
                .filter(e -> e.getStatus() != ExamStatus.DRAFT)
                .map(this::toExamSummary)
                .collect(Collectors.toList());
    }

    public ExamNotification createNotification(ExamNotificationRequest req) {
        if (req.getTargetRole() == null || (!req.getTargetRole().equals("ALL") && !req.getTargetRole().equals("STUDENT") && !req.getTargetRole().equals("TEACHER"))) {
            throw new IllegalArgumentException("Invalid announcement target: " + req.getTargetRole() + ". Only Everyone, Students, and Teachers targets are allowed.");
        }
        ExamNotification n = new ExamNotification();
        n.setTitle(req.getTitle());
        n.setMessage(req.getMessage());
        n.setTargetRole(req.getTargetRole());
        if (req.getExamId() != null) {
            examRepository.findById(req.getExamId()).ifPresent(n::setExam);
        }
        return notificationRepository.save(n);
    }

    public List<Map<String, Object>> getNotifications(String role, int limit) {
        return notificationRepository.findForRole(role,
                        org.springframework.data.domain.PageRequest.of(0, limit))
                .stream()
                .map(n -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", n.getId());
                    m.put("title", n.getTitle());
                    m.put("message", n.getMessage());
                    m.put("targetRole", n.getTargetRole());
                    m.put("examId", n.getExam() != null ? n.getExam().getId() : null);
                    m.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
                    return m;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStudentExamSummary(String studentId, Long examId) {
        List<com.result.main.entity.ExamResult> results = examResultRepository
                .findByStudentStudentIdAndExamIdAndPublishedTrue(studentId, examId);
        if (results.isEmpty()) {
            throw new RuntimeException("No published results found");
        }
        Exam exam = results.get(0).getExam();
        List<Map<String, Object>> subjects = new ArrayList<>();
        List<ResultCalculationService.SubjectScore> scoreList = new ArrayList<>();
        
        List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(examId);
        Map<Long, ExamSubject> examSubjectMap = examSubjects.stream()
                .collect(Collectors.toMap(es -> es.getSubject().getId(), es -> es, (a, b) -> a));

        for (com.result.main.entity.ExamResult r : results) {
            ExamSubject es = examSubjectMap.get(r.getSubject().getId());
            int maxMarks = es != null ? es.getTotalMarks() : 100;
            int passMarks = es != null ? es.getPassMarks() : 35;
            int mo = r.getMarksObtained() != null ? r.getMarksObtained() : 0;

            scoreList.add(new ResultCalculationService.SubjectScore(mo, maxMarks, passMarks));

            Map<String, Object> sub = new LinkedHashMap<>();
            sub.put("subjectCode", r.getSubject().getSubjectCode());
            sub.put("subjectName", r.getSubject().getSubjectName());
            sub.put("marksObtained", mo);
            sub.put("maxMarks", maxMarks);
            sub.put("grade", resultCalculationService.calculateGrade(mo, maxMarks, passMarks));
            sub.put("remarks", r.getRemarks());
            subjects.add(sub);
        }

        Map<String, Object> calcStats = resultCalculationService.calculateOverallStats(scoreList);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("examId", examId);
        summary.put("examName", exam.getExamName());
        summary.put("examType", exam.getExamType());
        summary.put("subjects", subjects);
        summary.put("totalMarks", calcStats.get("totalMarks"));
        summary.put("maxMarks", calcStats.get("maxMarks"));
        summary.put("percentage", calcStats.get("percentage"));
        summary.put("grade", calcStats.get("grade"));
        summary.put("gpa", calcStats.get("gpa"));
        summary.put("status", calcStats.get("status"));
        return summary;
    }

    // --- helpers ---

    private void saveExamSubjects(Exam exam, List<ExamSubjectRequest> subjects) {
        for (ExamSubjectRequest sr : subjects) {
            if (sr.getSubjectId() == null) continue;
            
            // Validate subject date is within main exam duration
            if (sr.getExamDate() != null) {
                if (exam.getStartDate() != null && sr.getExamDate().isBefore(exam.getStartDate())) {
                    throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST, "Subject exam date must be within exam duration");
                }
                if (exam.getEndDate() != null && sr.getExamDate().isAfter(exam.getEndDate())) {
                    throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST, "Subject exam date must be within exam duration");
                }
            }

            ExamSubject es = new ExamSubject();
            es.setExam(exam);
            es.setSubject(subjectRepository.findById(sr.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
            if (sr.getTeacherId() != null) {
                teacherRepository.findById(sr.getTeacherId()).ifPresent(es::setTeacher);
            }
            es.setExamDate(sr.getExamDate());
            if (sr.getStartTime() != null && !sr.getStartTime().isBlank()) {
                es.setStartTime(LocalTime.parse(sr.getStartTime()));
            }
            if (sr.getEndTime() != null && !sr.getEndTime().isBlank()) {
                es.setEndTime(LocalTime.parse(sr.getEndTime()));
            }
            es.setTotalMarks(sr.getTotalMarks() != null ? sr.getTotalMarks() : (sr.getMaxMarks() != null ? sr.getMaxMarks() : 100));
            es.setMaxMarks(sr.getTotalMarks() != null ? sr.getTotalMarks() : (sr.getMaxMarks() != null ? sr.getMaxMarks() : 100));
            es.setPassMarks(sr.getPassMarks() != null ? sr.getPassMarks() : 35);
            es.setRoomNumber(sr.getRoomNumber());
            examSubjectRepository.save(es);
        }
    }

    private void applyExamFields(Exam exam, ExamRequest request) {
        if (request.getExamName() != null) exam.setExamName(request.getExamName());
        if (request.getExamType() != null) exam.setExamType(request.getExamType());
        if (request.getClassName() != null) exam.setClassName(request.getClassName());
        if (request.getSection() != null) exam.setSection(request.getSection());
        if (request.getStartDate() != null) exam.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) exam.setEndDate(request.getEndDate());
    }

    private void verifyTeacherAssignment(Long examId, Long userId, Long subjectId) {
        User user = userRepository.findById(userId).orElseThrow();
        Teacher teacher = teacherRepository.findByUser(user).orElseThrow();
        boolean assigned = examSubjectRepository.findByExamIdAndTeacherId(examId, teacher.getId())
                .stream().anyMatch(es -> es.getSubject().getId().equals(subjectId));
        if (!assigned) throw new RuntimeException("You are not assigned to this subject for this exam");
    }

    private void notify(String title, String message, String role, Exam exam) {
        ExamNotification n = new ExamNotification();
        n.setTitle(title);
        n.setMessage(message);
        n.setTargetRole(role);
        n.setExam(exam);
        notificationRepository.save(n);
    }

    private Map<String, Object> toExamSummary(Exam e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("examName", e.getExamName());
        m.put("examType", e.getExamType());
        m.put("className", e.getClassName());
        m.put("section", e.getSection());
        m.put("startDate", e.getStartDate() != null ? e.getStartDate().toString() : null);
        m.put("endDate", e.getEndDate() != null ? e.getEndDate().toString() : null);
        m.put("status", e.getStatus() != null ? e.getStatus().name() : null);
        m.put("published", e.isPublished());
        m.put("createdBy", e.getCreatedBy());
        m.put("createdAt", e.getCreatedAt() != null ? e.getCreatedAt().toString() : null);
        m.put("subjectCount", examSubjectRepository.findByExamId(e.getId()).size());
        m.put("pendingMarks", examResultRepository.countByExamIdAndPublishedFalse(e.getId()));
        return m;
    }

    private Map<String, Object> toExamDetail(Exam e) {
        Map<String, Object> m = toExamSummary(e);
        List<Map<String, Object>> subjects = examSubjectRepository.findByExamId(e.getId()).stream()
                .map(this::toSubjectMap)
                .collect(Collectors.toList());
        m.put("subjects", subjects);
        return m;
    }

    private Map<String, Object> toSubjectMap(ExamSubject es) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", es.getId());
        m.put("subjectId", es.getSubject().getId());
        m.put("subjectCode", es.getSubject().getSubjectCode());
        m.put("subjectName", es.getSubject().getSubjectName());
        m.put("teacherId", es.getTeacher() != null ? es.getTeacher().getId() : null);
        m.put("teacherName", es.getTeacher() != null ? es.getTeacher().getName() : null);
        m.put("examDate", es.getExamDate() != null ? es.getExamDate().toString() : null);
        m.put("startTime", es.getStartTime() != null ? es.getStartTime().toString() : null);
        m.put("endTime", es.getEndTime() != null ? es.getEndTime().toString() : null);
        m.put("maxMarks", es.getMaxMarks());
        m.put("passMarks", es.getPassMarks());
        m.put("roomNumber", es.getRoomNumber());
        return m;
    }

    private Map<String, Object> toTimetableEntry(ExamSubject es) {
        Exam e = es.getExam();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("examId", e.getId());
        m.put("examName", e.getExamName());
        m.put("examType", e.getExamType());
        m.put("className", e.getClassName());
        m.put("section", e.getSection());
        m.put("status", e.getStatus() != null ? e.getStatus().name() : null);
        m.put("subjectCode", es.getSubject().getSubjectCode());
        m.put("subjectName", es.getSubject().getSubjectName());
        m.put("teacherName", es.getTeacher() != null ? es.getTeacher().getName() : null);
        m.put("examDate", es.getExamDate() != null ? es.getExamDate().toString() : null);
        m.put("startTime", es.getStartTime() != null ? es.getStartTime().toString() : null);
        m.put("endTime", es.getEndTime() != null ? es.getEndTime().toString() : null);
        m.put("maxMarks", es.getMaxMarks());
        m.put("roomNumber", es.getRoomNumber());
        long mins = 0;
        if (es.getStartTime() != null && es.getEndTime() != null) {
            mins = java.time.Duration.between(es.getStartTime(), es.getEndTime()).toMinutes();
        }
        m.put("durationMinutes", mins);
        return m;
    }

    private Map<String, Object> toResultMap(ExamResult r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("examId", r.getExam().getId());
        m.put("examName", r.getExam().getExamName());
        m.put("studentId", r.getStudent().getStudentId());
        m.put("subjectCode", r.getSubject().getSubjectCode());
        m.put("subjectName", r.getSubject().getSubjectName());
        m.put("marksObtained", r.getMarksObtained());
        m.put("grade", r.getGrade());
        m.put("remarks", r.getRemarks());
        m.put("published", r.isPublished());
        return m;
    }

    private String calculateGrade(Integer marks, int maxMarks, int passMarks) {
        if (marks == null) return "";
        double pct = maxMarks > 0 ? marks * 100.0 / maxMarks : 0;
        if (pct < (passMarks * 100.0 / maxMarks)) return "F";
        return overallGrade(pct);
    }

    private String overallGrade(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B";
        if (pct >= 60) return "C";
        if (pct >= 50) return "D";
        return "F";
    }

    private ExamStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return ExamStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            return null;
        }
    }

    private String emptyToNull(String v) {
        return v == null || v.trim().isEmpty() ? null : v.trim();
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public List<Map<String, Object>> getPublishedResultsForClassAndExam(String className, Long examId) {
        List<ExamResult> results = examResultRepository.findPublishedByClassAndExam(className, examId);
        
        List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(examId);
        Map<Long, ExamSubject> examSubjectMap = examSubjects.stream()
                .collect(Collectors.toMap(es -> es.getSubject().getId(), es -> es, (a, b) -> a));

        List<Map<String, Object>> mapped = new ArrayList<>();
        for (ExamResult er : results) {
            ExamSubject es = examSubjectMap.get(er.getSubject().getId());
            int maxMarks = es != null ? es.getTotalMarks() : 100;
            int passMarks = es != null ? es.getPassMarks() : 35;

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", er.getId());
            map.put("marks", er.getMarksObtained());
            map.put("grade", resultCalculationService.calculateGrade(er.getMarksObtained(), maxMarks, passMarks));
            map.put("comments", er.getRemarks() != null ? er.getRemarks() : "");
            map.put("published", er.isPublished());
            map.put("maxMarks", maxMarks);
            map.put("passMarks", passMarks);

            // Student
            Map<String, Object> sMap = new LinkedHashMap<>();
            sMap.put("studentId", er.getStudent().getStudentId());
            sMap.put("name", er.getStudent().getName());
            sMap.put("className", er.getStudent().getClassName());
            sMap.put("section", er.getStudent().getSection());
            sMap.put("email", er.getStudent().getEmail());
            map.put("student", sMap);

            // Exam
            Map<String, Object> eMap = new LinkedHashMap<>();
            eMap.put("id", er.getExam().getId());
            eMap.put("examName", er.getExam().getExamName());
            eMap.put("examType", er.getExam().getExamType());
            eMap.put("className", er.getExam().getClassName());
            eMap.put("section", er.getExam().getSection());
            map.put("exam", eMap);

            // Subject
            Map<String, Object> subMap = new LinkedHashMap<>();
            subMap.put("id", er.getSubject().getId());
            subMap.put("subjectCode", er.getSubject().getSubjectCode());
            subMap.put("subjectName", er.getSubject().getSubjectName());
            map.put("subject", subMap);

            mapped.add(map);
        }
        return mapped;
    }
}
