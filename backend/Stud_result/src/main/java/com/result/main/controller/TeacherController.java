package com.result.main.controller;

import com.result.main.entity.Teacher;
import com.result.main.entity.User;
import com.result.main.entity.Subject;
import com.result.main.entity.Role;
import com.result.main.repository.TeacherRepository;
import com.result.main.repository.UserRepository;
import com.result.main.repository.SubjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.result.main.repository.StudentRepository studentRepository;

    // 🔹 UNIFIED FLOW: CREATE USER + TEACHER PROFILE (Admin only)
    @PostMapping("/create-full")
    public ResponseEntity<?> createTeacherFull(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String password = (String) payload.get("password");
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String phone = (String) payload.get("phone");
        String status = (String) payload.get("status");
        String gender = (String) payload.get("gender");
        
        Object subjectIdObj = payload.get("subjectId");
        if (username == null || username.trim().isEmpty() ||
            password == null || password.trim().isEmpty() ||
            name == null || name.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            subjectIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username, Password, Name, Email, and Subject are required"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }

        Long subjectId = Long.valueOf(String.valueOf(subjectIdObj));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // 1. Create the credentials account
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.TEACHER);
        user.setCreatedBy("ADMIN");
        User savedUser = userRepository.save(user);

        // 2. Create the teacher profile
        Teacher teacher = new Teacher();
        teacher.setName(name);
        teacher.setEmail(email);
        teacher.setPhone(phone);
        teacher.setStatus(status != null ? status : "ACTIVE");
        teacher.setGender(gender != null ? gender : "Male");
        teacher.setUser(savedUser);
        teacher.setSubject(subject);

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTeacher);
    }

    // 🔹 LEGACY/COMPATIBILITY ADD TEACHER
    @PostMapping("/add")
    public Teacher addTeacher(@RequestBody Teacher teacher) {
        if (teacher.getUser() == null || teacher.getUser().getId() == null) {
            throw new RuntimeException("User ID is required");
        }

        if (teacher.getSubject() == null || teacher.getSubject().getId() == null) {
            throw new RuntimeException("Subject ID is required");
        }

        Long userId = teacher.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.TEACHER) {
            throw new RuntimeException("Only users with role TEACHER can be added as Teacher");
        }

        Long subjectId = teacher.getSubject().getId();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        teacher.setUser(user);
        teacher.setSubject(subject);

        return teacherRepository.save(teacher);
    }

    // 🔹 GET ALL TEACHERS (Admin only)
    @GetMapping("/all")
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // 🔹 GET TEACHER BY USER ID (For Profile viewing securely)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTeacherByUserId(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Teacher> teacher = teacherRepository.findByUser(user);
        if (teacher.isPresent()) {
            return ResponseEntity.ok(teacher.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Teacher profile not found"));
    }

    // 🔹 GET TEACHER BY ID
    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    // 🔹 UPDATE TEACHER (Admin only)
    @PutMapping("/update/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher updatedTeacher) {
        Optional<Teacher> optionalTeacher = teacherRepository.findById(id);

        if (optionalTeacher.isPresent()) {
            Teacher teacher = optionalTeacher.get();

            teacher.setName(updatedTeacher.getName());
            teacher.setEmail(updatedTeacher.getEmail());
            teacher.setPhone(updatedTeacher.getPhone());
            teacher.setStatus(updatedTeacher.getStatus());
            teacher.setGender(updatedTeacher.getGender());

            if (updatedTeacher.getUser() != null && updatedTeacher.getUser().getId() != null) {
                Long userId = updatedTeacher.getUser().getId();
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                teacher.setUser(user);
            }

            if (updatedTeacher.getSubject() != null && updatedTeacher.getSubject().getId() != null) {
                Long subjectId = updatedTeacher.getSubject().getId();
                Subject subject = subjectRepository.findById(subjectId)
                        .orElseThrow(() -> new RuntimeException("Subject not found"));
                teacher.setSubject(subject);
            }

            return teacherRepository.save(teacher);
        } else {
            throw new RuntimeException("Teacher not found");
        }
    }

    // 🔹 SECURE CASCADE DELETE TEACHER (Admin only)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        User user = teacher.getUser();

        // 1. Delete teacher details entry first
        teacherRepository.delete(teacher);

        // 2. Cascade delete corresponding user account securely
        if (user != null) {
            userRepository.delete(user);
        }

        return ResponseEntity.ok(Map.of("message", "Teacher and associated user account deleted successfully"));
    }

    // 🔹 GET SUBJECTS ASSIGNED TO LOGGED-IN TEACHER
    @GetMapping("/subjects")
    public ResponseEntity<?> getLoggedTeacherSubjects(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        
        System.out.println("🔍 GET /subjects requested by teacher: " + principal.getName());
        
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        
        Optional<Teacher> teacherOpt = teacherRepository.findByUser(userOpt.get());
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        Teacher teacher = teacherOpt.get();
        Subject subject = teacher.getSubject();
        
        if (subject != null) {
            Map<String, Object> subjectMap = new java.util.HashMap<>();
            subjectMap.put("id", subject.getId());
            subjectMap.put("name", subject.getSubjectName());
            subjectMap.put("subjectName", subject.getSubjectName());
            subjectMap.put("subjectCode", subject.getSubjectCode());
            return ResponseEntity.ok(List.of(subjectMap));
        }
        
        return ResponseEntity.ok(List.of());
    }

    // 🔹 GET DASHBOARD STATS FOR LOGGED-IN TEACHER
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getTeacherDashboardStats(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        
        System.out.println("🔍 GET /dashboard-stats requested by: " + principal.getName());
        
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        
        Optional<Teacher> teacherOpt = teacherRepository.findByUser(userOpt.get());
        
        int assignedCount = 0;
        if (teacherOpt.isPresent() && teacherOpt.get().getSubject() != null) {
            assignedCount = 1;
        }
        
        long totalStudents = studentRepository.count();
        
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("assignedSubjects", assignedCount);
        stats.put("totalStudents", totalStudents);
        
        return ResponseEntity.ok(stats);
    }
}