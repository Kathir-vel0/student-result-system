package com.result.main.controller;

import com.result.main.dto.PageResponse;
import com.result.main.entity.Attendance;
import com.result.main.entity.AttendanceStatus;
import com.result.main.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/mark")
    public ResponseEntity<Attendance> mark(@RequestBody Map<String, String> body, Authentication auth) {
        String studentId = body.get("studentId");
        LocalDate date = body.get("date") != null ? LocalDate.parse(body.get("date")) : LocalDate.now();
        AttendanceStatus status = AttendanceStatus.valueOf(body.get("status").toUpperCase());
        String username = auth != null ? auth.getName() : "unknown";
        String role = auth != null && auth.getAuthorities().iterator().hasNext()
                ? auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "") : "TEACHER";
        return ResponseEntity.ok(attendanceService.markAttendance(studentId, date, status, username, role));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Attendance>> bulk(@RequestBody Map<String, Object> body, Authentication auth) {
        @SuppressWarnings("unchecked")
        List<Map<String, String>> entries = (List<Map<String, String>>) body.get("entries");
        LocalDate date = body.get("date") != null
                ? LocalDate.parse(body.get("date").toString()) : LocalDate.now();
        String username = auth != null ? auth.getName() : "unknown";
        String role = auth != null && auth.getAuthorities().iterator().hasNext()
                ? auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "") : "TEACHER";
        return ResponseEntity.ok(attendanceService.markBulk(entries, date, username, role));
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<Attendance>> page(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(attendanceService.search(className, date, status, search, page, size));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> studentHistory(
            @PathVariable String studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(attendanceService.getStudentHistory(studentId, start, end));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<Map<String, Object>> studentSummary(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentSummary(studentId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> classAnalytics(
            @RequestParam String className,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(attendanceService.getClassAnalytics(className, start, end));
    }
}
