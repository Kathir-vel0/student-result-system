package com.result.main.service;

import com.result.main.dto.PageResponse;
import com.result.main.entity.Attendance;
import com.result.main.entity.AttendanceStatus;
import com.result.main.entity.Student;
import com.result.main.repository.AttendanceRepository;
import com.result.main.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            AuditService auditService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Attendance markAttendance(String studentId, LocalDate date, AttendanceStatus status, String markedBy, String role) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance attendance = attendanceRepository.findByStudentAndDate(student, date)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setClassName(student.getClassName() != null ? student.getClassName() : "N/A");
        attendance.setDate(date);
        attendance.setStatus(status);
        attendance.setMarkedBy(markedBy);

        Attendance saved = attendanceRepository.save(attendance);
        auditService.log("ATTENDANCE_UPDATED", markedBy, role, "Attendance",
                "Marked " + status + " for student " + studentId + " on " + date);
        return saved;
    }

    @Transactional
    public List<Attendance> markBulk(List<Map<String, String>> entries, LocalDate date, String markedBy, String role) {
        List<Attendance> saved = new ArrayList<>();
        for (Map<String, String> entry : entries) {
            String studentId = entry.get("studentId");
            String statusStr = entry.get("status");
            if (studentId == null || statusStr == null) continue;
            AttendanceStatus status = AttendanceStatus.valueOf(statusStr.toUpperCase());
            saved.add(markAttendance(studentId, date, status, markedBy, role));
        }
        return saved;
    }

    public PageResponse<Attendance> search(String className, LocalDate date, AttendanceStatus status,
                                           String search, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "date"));
        Page<Attendance> result = attendanceRepository.searchAttendance(
                emptyToNull(className), date, status, emptyToNull(search), pageable);
        return new PageResponse<>(result.getContent(), page, safeSize, result.getTotalElements());
    }

    public List<Attendance> getStudentHistory(String studentId, LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().minusMonths(1);
        if (end == null) end = LocalDate.now();
        return attendanceRepository.findByStudentStudentIdAndDateBetween(studentId, start, end);
    }

    public Map<String, Object> getStudentSummary(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        long total = attendanceRepository.countByStudentId(student.getId());
        long present = attendanceRepository.countPresentByStudentId(student.getId());
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalDays", total);
        summary.put("presentDays", present);
        summary.put("percentage", total > 0 ? Math.round(present * 1000.0 / total) / 10.0 : 0);
        return summary;
    }

    public Map<String, Object> getClassAnalytics(String className, LocalDate start, LocalDate end) {
        final LocalDate rangeStart = start != null ? start : LocalDate.now().minusDays(30);
        final LocalDate rangeEnd = end != null ? end : LocalDate.now();
        List<Attendance> records = attendanceRepository.searchAttendance(
                className, null, null, null,
                PageRequest.of(0, 10000, Sort.by("date"))
        ).getContent().stream()
                .filter(a -> !a.getDate().isBefore(rangeStart) && !a.getDate().isAfter(rangeEnd))
                .toList();

        long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("present", present);
        analytics.put("absent", absent);
        analytics.put("late", late);
        analytics.put("total", records.size());
        return analytics;
    }

    private String emptyToNull(String v) {
        return v == null || v.trim().isEmpty() ? null : v.trim();
    }
}
