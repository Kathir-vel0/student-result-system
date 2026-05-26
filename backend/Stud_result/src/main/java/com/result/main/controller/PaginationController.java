package com.result.main.controller;

import com.result.main.dto.PageResponse;
import com.result.main.entity.Result;
import com.result.main.entity.Student;
import com.result.main.entity.Subject;
import com.result.main.entity.Teacher;
import com.result.main.service.PaginationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PaginationController {

    private final PaginationService paginationService;

    public PaginationController(PaginationService paginationService) {
        this.paginationService = paginationService;
    }

    @GetMapping("/students/page")
    public ResponseEntity<PageResponse<Student>> pageStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paginationService.pageStudents(search, className, section, page, size));
    }

    @GetMapping("/teachers/page")
    public ResponseEntity<PageResponse<Teacher>> pageTeachers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paginationService.pageTeachers(search, page, size));
    }

    @GetMapping("/subjects/page")
    public ResponseEntity<PageResponse<Subject>> pageSubjects(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paginationService.pageSubjects(search, page, size));
    }

    @GetMapping("/results/page")
    public ResponseEntity<PageResponse<Result>> pageResults(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) Integer minMarks,
            @RequestParam(required = false) Integer maxMarks,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paginationService.pageResults(
                search, className, subjectCode, minMarks, maxMarks, page, size));
    }
}
