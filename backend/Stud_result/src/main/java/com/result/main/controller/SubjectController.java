package com.result.main.controller;

import com.result.main.entity.Subject;
import com.result.main.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    // ADD
    @PostMapping("/add")
    public Subject addSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    // GET ALL
    @GetMapping("/all")
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public Subject updateSubject(@PathVariable Long id, @RequestBody Subject updatedSubject) {
        Optional<Subject> subject = subjectRepository.findById(id);

        if (subject.isPresent()) {
            Subject s = subject.get();
            s.setSubjectName(updatedSubject.getSubjectName()); 
            s.setSubjectCode(updatedSubject.getSubjectCode());// adjust field if different
            return subjectRepository.save(s);
        } else {
            return null;
        }
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public String deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
        return "Subject deleted successfully";
    }
}