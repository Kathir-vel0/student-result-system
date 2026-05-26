package com.result.main.controller;

import com.result.main.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> teacherAnalytics(Authentication auth) {
        String username = auth != null ? auth.getName() : "";
        return ResponseEntity.ok(analyticsService.getTeacherAnalytics(username));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> studentAnalytics(@PathVariable String studentId) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(studentId));
    }

    @GetMapping("/report-card/{studentId}")
    public ResponseEntity<Map<String, Object>> reportCardData(@PathVariable String studentId) {
        return ResponseEntity.ok(analyticsService.getReportCardData(studentId));
    }
}
