package com.result.main.controller;

import com.result.main.entity.Teacher;

import com.result.main.entity.User;
import com.result.main.entity.Subject;
import com.result.main.repository.TeacherRepository;
import com.result.main.repository.UserRepository;
import com.result.main.repository.SubjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import com.result.main.entity.Role;
@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    // ✅ ADD TEACHER
    @PostMapping("/add")
    public Teacher addTeacher(@RequestBody Teacher teacher) {

        // ✅ Null check
        if (teacher.getUser() == null || teacher.getUser().getId() == null) {
            throw new RuntimeException("User ID is required");
        }

        if (teacher.getSubject() == null || teacher.getSubject().getId() == null) {
            throw new RuntimeException("Subject ID is required");
        }

        // 🔥 Fetch User
        Long userId = teacher.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Role validation
        if (user.getRole() != Role.TEACHER) {
            throw new RuntimeException("Only users with role TEACHER can be added as Teacher");
        }

        // 🔥 Fetch Subject
        Long subjectId = teacher.getSubject().getId();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        teacher.setUser(user);
        teacher.setSubject(subject);

        return teacherRepository.save(teacher);
    }

    // ✅ GET ALL TEACHERS
    @GetMapping("/all")
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // ✅ GET TEACHER BY ID
    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    // ✅ UPDATE TEACHER
    @PutMapping("/update/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher updatedTeacher) {

        Optional<Teacher> optionalTeacher = teacherRepository.findById(id);

        if (optionalTeacher.isPresent()) {
            Teacher teacher = optionalTeacher.get();

            // Basic fields
            teacher.setName(updatedTeacher.getName());
            teacher.setEmail(updatedTeacher.getEmail());
            teacher.setPhone(updatedTeacher.getPhone());
            teacher.setStatus(updatedTeacher.getStatus());

            // 🔥 Update User
            Long userId = updatedTeacher.getUser().getId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            teacher.setUser(user);

            // 🔥 Update Subject
            Long subjectId = updatedTeacher.getSubject().getId();
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            teacher.setSubject(subject);

            return teacherRepository.save(teacher);

        } else {
            throw new RuntimeException("Teacher not found");
        }
    }

    // ✅ DELETE TEACHER
    @DeleteMapping("/delete/{id}")
    public String deleteTeacher(@PathVariable Long id) {

        if (!teacherRepository.existsById(id)) {
            throw new RuntimeException("Teacher not found");
        }

        teacherRepository.deleteById(id);
        return "Teacher deleted successfully";
    }
}