package com.result.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.result.main.entity.Student;
import com.result.main.entity.User;
import com.result.main.repository.StudentRepository;
import com.result.main.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    // ================= CREATE STUDENT =================
    @PostMapping("/user/{userId}")
    public Student createStudent(@PathVariable Long userId,
                                 @RequestBody Student studentDetails) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (studentRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("Student already exists for this user");
        }

        studentDetails.setUser(user);

        return studentRepository.save(studentDetails);
    }

    // ================= GET ALL =================
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // ================= ✅ NEW API (IMPORTANT) =================
    @GetMapping("/user/{userId}")
    public Student getStudentByUserId(@PathVariable Long userId, Authentication auth) {
        logger.info("Fetching student profile for userId: {}", userId);
        if (auth != null) {
            String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            logger.debug("User role extracted from auth: {}", role);
            if ("STUDENT".equals(role)) {
                User authUser = userRepository.findByUsername(auth.getName())
                        .orElseThrow(() -> {
                            logger.error("Unauthorized: Username '{}' not found in system.", auth.getName());
                            return new AccessDeniedException("Unauthorized");
                        });
                if (!authUser.getId().equals(userId)) {
                    logger.warn("Access Denied: Authenticated user id {} tried to access user id {}", authUser.getId(), userId);
                    throw new AccessDeniedException("Access denied: You can only access your own profile.");
                }
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> {
                    logger.error("Student profile not found for user id: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
                });

        logger.info("Successfully fetched student profile for userId: {} (studentId: {})", userId, student.getStudentId());
        return student;
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id,
                                 @RequestBody Student studentDetails) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setStudentId(studentDetails.getStudentId());
        student.setName(studentDetails.getName());
        student.setPhoto(studentDetails.getPhoto());
        student.setClassName(studentDetails.getClassName());
        student.setSection(studentDetails.getSection());
        student.setEmail(studentDetails.getEmail());
        student.setDob(studentDetails.getDob());

        return studentRepository.save(student);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        studentRepository.delete(student);

        return "Student deleted successfully";
    }
}