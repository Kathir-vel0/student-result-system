package com.result.main.controller;

import com.result.main.config.JwtUtils;
import com.result.main.dto.*;
import com.result.main.entity.ExamNotification;
import com.result.main.entity.User;
import com.result.main.entity.Student;
import com.result.main.repository.UserRepository;
import com.result.main.repository.StudentRepository;
import com.result.main.service.ExamAnalyticsService;
import com.result.main.service.ExamService;
import org.springframework.security.access.AccessDeniedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;
    private final ExamAnalyticsService examAnalyticsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public ExamController(ExamService examService, ExamAnalyticsService examAnalyticsService, JwtUtils jwtUtils,
                          UserRepository userRepository, StudentRepository studentRepository) {
        this.examService = examService;
        this.examAnalyticsService = examAnalyticsService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<Map<String, Object>>> page(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(examService.searchExams(search, className, section, status, fromDate, toDate, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody ExamRequest request, Authentication auth) {
        return ResponseEntity.ok(examService.createExam(request, username(auth), role(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id, @RequestBody ExamRequest request, Authentication auth) {
        return ResponseEntity.ok(examService.updateExam(id, request, username(auth), role(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        examService.deleteExam(id, username(auth), role(auth));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(examService.updateStatus(id, body.get("status"), username(auth), role(auth)));
    }

    @PostMapping("/marks")
    public ResponseEntity<List<Map<String, Object>>> saveMarks(
            @RequestBody ExamMarkEntryRequest request, Authentication auth, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(examService.saveMarks(request, username(auth), role(auth), userId(httpRequest)));
    }

    @GetMapping("/{examId}/marks")
    public ResponseEntity<List<Map<String, Object>>> getMarks(
            @PathVariable Long examId,
            @RequestParam Long subjectId,
            @RequestParam(defaultValue = "true") boolean includeUnpublished,
            Authentication auth) {
        if ("STUDENT".equals(role(auth))) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(examService.getMarksForEntry(examId, subjectId, includeUnpublished));
    }

    @PostMapping("/{examId}/submit-review")
    public ResponseEntity<Void> submitReview(@PathVariable Long examId, Authentication auth, HttpServletRequest req) {
        examService.submitForReview(examId, username(auth), role(auth), userId(req));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{examId}/publish")
    public ResponseEntity<Map<String, Object>> publish(@PathVariable Long examId, Authentication auth) {
        return ResponseEntity.ok(examService.publishResults(examId, username(auth), role(auth)));
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> timetable(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long examId) {
        return ResponseEntity.ok(examService.getTimetable(className, section, teacherId, examId));
    }

    @GetMapping("/teacher/my-exams")
    public ResponseEntity<List<Map<String, Object>>> teacherExams(Authentication auth) {
        return ResponseEntity.ok(examService.getTeacherExams(username(auth)));
    }

    @GetMapping("/student/{studentId}/exams")
    public ResponseEntity<List<Map<String, Object>>> studentExams(@PathVariable String studentId, Authentication auth) {
        checkStudentPrivilege(studentId, auth);
        return ResponseEntity.ok(examService.getStudentExams(studentId));
    }

    @GetMapping("/student/{studentId}/results")
    public ResponseEntity<List<Map<String, Object>>> studentResults(@PathVariable String studentId, Authentication auth) {
        checkStudentPrivilege(studentId, auth);
        return ResponseEntity.ok(examService.getStudentPublishedResults(studentId));
    }

    @GetMapping("/student/{studentId}/results/{examId}")
    public ResponseEntity<List<Map<String, Object>>> studentExamResults(
            @PathVariable String studentId, @PathVariable Long examId, Authentication auth) {
        checkStudentPrivilege(studentId, auth);
        return ResponseEntity.ok(examService.getStudentExamResults(studentId, examId));
    }

    @GetMapping("/student/{studentId}/summary/{examId}")
    public ResponseEntity<Map<String, Object>> studentSummary(
            @PathVariable String studentId, @PathVariable Long examId, Authentication auth) {
        checkStudentPrivilege(studentId, auth);
        return ResponseEntity.ok(examService.getStudentExamSummary(studentId, examId));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> notifications(
            Authentication auth, @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(examService.getNotifications(role(auth), limit));
    }

    @PostMapping("/notifications")
    public ResponseEntity<ExamNotification> createNotification(@RequestBody ExamNotificationRequest request) {
        return ResponseEntity.ok(examService.createNotification(request));
    }

    @GetMapping("/analytics/admin/{examId}")
    public ResponseEntity<Map<String, Object>> adminAnalytics(@PathVariable Long examId) {
        return ResponseEntity.ok(examAnalyticsService.getAdminAnalytics(examId));
    }

    @GetMapping("/analytics/teacher")
    public ResponseEntity<Map<String, Object>> teacherAnalytics(
            @RequestParam Long examId, @RequestParam Long subjectId) {
        return ResponseEntity.ok(examAnalyticsService.getTeacherAnalytics(examId, subjectId));
    }

    @GetMapping("/analytics/student/{studentId}")
    public ResponseEntity<Map<String, Object>> studentAnalytics(@PathVariable String studentId, Authentication auth) {
        checkStudentPrivilege(studentId, auth);
        return ResponseEntity.ok(examAnalyticsService.getStudentAnalytics(studentId));
    }

    private void checkStudentPrivilege(String studentId, Authentication auth) {
        if (auth != null) {
            String role = role(auth);
            if ("STUDENT".equals(role)) {
                User user = userRepository.findByUsername(auth.getName())
                        .orElseThrow(() -> new AccessDeniedException("Unauthorized"));
                Student student = studentRepository.findByUser(user)
                        .orElseThrow(() -> new AccessDeniedException("Student profile not found"));
                if (!student.getStudentId().equals(studentId)) {
                    throw new AccessDeniedException("Access denied: You can only access your own records.");
                }
            }
        }
    }

    private String username(Authentication auth) {
        return auth != null ? auth.getName() : "system";
    }

    private String role(Authentication auth) {
        if (auth == null || !auth.getAuthorities().iterator().hasNext()) return "ADMIN";
        return auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
    }

    private Long userId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtils.getUserIdFromToken(authHeader.substring(7));
        }
        return null;
    }
}
