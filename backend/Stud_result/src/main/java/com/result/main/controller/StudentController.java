package com.result.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.result.main.entity.Student;
import com.result.main.entity.User;
import com.result.main.repository.StudentRepository;
import com.result.main.repository.UserRepository;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

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
    public Student getStudentByUserId(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student not found"));
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