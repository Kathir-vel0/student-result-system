package com.result.main.service;

import com.result.main.dto.PageResponse;
import com.result.main.entity.*;
import com.result.main.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PaginationService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final ResultRepository resultRepository;

    public PaginationService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            SubjectRepository subjectRepository,
            ResultRepository resultRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.resultRepository = resultRepository;
    }

    public PageResponse<Student> pageStudents(String search, String className, String section, int page, int size) {
        PageRequest pr = pageRequest(page, size, "name");
        Page<Student> result = studentRepository.searchStudents(
                emptyToNull(search), emptyToNull(className), emptyToNull(section), pr);
        return new PageResponse<>(result.getContent(), page, pr.getPageSize(), result.getTotalElements());
    }

    public PageResponse<Teacher> pageTeachers(String search, int page, int size) {
        PageRequest pr = pageRequest(page, size, "name");
        Page<Teacher> result = teacherRepository.searchTeachers(emptyToNull(search), pr);
        return new PageResponse<>(result.getContent(), page, pr.getPageSize(), result.getTotalElements());
    }

    public PageResponse<Subject> pageSubjects(String search, int page, int size) {
        PageRequest pr = pageRequest(page, size, "subjectName");
        Page<Subject> result = subjectRepository.searchSubjects(emptyToNull(search), pr);
        return new PageResponse<>(result.getContent(), page, pr.getPageSize(), result.getTotalElements());
    }

    public PageResponse<Result> pageResults(String search, String className, String subjectCode,
                                            Integer minMarks, Integer maxMarks, int page, int size) {
        PageRequest pr = pageRequest(page, size, "id");
        Page<Result> result = resultRepository.searchResults(
                emptyToNull(search), emptyToNull(className), emptyToNull(subjectCode),
                minMarks, maxMarks, pr);
        return new PageResponse<>(result.getContent(), page, pr.getPageSize(), result.getTotalElements());
    }

    private PageRequest pageRequest(int page, int size, String sortField) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        return PageRequest.of(Math.max(page, 0), safeSize, Sort.by(sortField).ascending());
    }

    private String emptyToNull(String v) {
        return v == null || v.trim().isEmpty() ? null : v.trim();
    }
}
