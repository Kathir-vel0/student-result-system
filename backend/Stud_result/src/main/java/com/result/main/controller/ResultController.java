package com.result.main.controller;

import com.result.main.entity.Result;


import com.result.main.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import com.result.main.entity.Student;
import com.result.main.entity.Subject;
import com.result.main.repository.StudentRepository;
import com.result.main.repository.SubjectRepository;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultRepository resultRepository;
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Value("${spring.mail.username:}")
    private String fromEmail;
    @Value("${spring.mail.password:}")
    private String mailPassword;

    // ADD (TEACHER)
 // ADD (TEACHER) using StudentId & SubjectCode
    @PostMapping("/add")
    public Result addResult(@RequestBody ResultRequest request) {

        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Subject subject = subjectRepository.findBySubjectCode(request.getSubjectCode())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // ✅ CHECK if result already exists
        Optional<Result> existing = resultRepository
                .findByStudentAndSubject(student, subject);

        Result result;

        if (existing.isPresent()) {
            // 🔁 UPDATE existing record
            result = existing.get();
        } else {
            // ➕ CREATE new record
            result = new Result();
            result.setStudent(student);
            result.setSubject(subject);
        }

        result.setMarks(request.getMarks());
        result.setGrade(request.getGrade());
        result.setComments(request.getComment());

        return resultRepository.save(result);
    }

    // VIEW BY STUDENT
    @GetMapping("/student/{studentId}")
    public List<Result> getResultByStudent(@PathVariable String studentId) {
        return resultRepository.findByStudentStudentId(studentId);
    }

    // UPDATE (TEACHER)
    @PutMapping("/update/{id}")
    public Result updateResult(@PathVariable Long id, @RequestBody Result updatedResult) {
        Optional<Result> result = resultRepository.findById(id);

        if (result.isPresent()) {
            Result r = result.get();
            r.setMarks(updatedResult.getMarks());
            r.setSubject(updatedResult.getSubject());
            r.setStudent(updatedResult.getStudent());
            r.setComments(updatedResult.getComments());
            return resultRepository.save(r);
        } else {
            return null;
        }
    }

    // DELETE (TEACHER / ADMIN)
    @DeleteMapping("/delete/{id}")
    public String deleteResult(@PathVariable Long id) {
        resultRepository.deleteById(id);
        return "Result deleted successfully";
    }

    // GET ALL
    @GetMapping("/all")
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }
    
 // ================= NEW: Publish results (email marksheet PDF) =================
    public static class PublishRequest {
        private String className;
        private List<PublishedStudent> students;

        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }

        public List<PublishedStudent> getStudents() { return students; }
        public void setStudents(List<PublishedStudent> students) { this.students = students; }
    }

    public static class PublishedStudent {
        private String studentId;
        private String studentEmail; // optional (we will use DB email as source of truth)
        private String studentName;  // optional

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
    }

    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publishResults(@RequestBody PublishRequest request) {
        Map<String, Object> resp = new HashMap<>();
        int success = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try {
            if (request == null || request.getStudents() == null || request.getStudents().isEmpty()) {
                resp.put("success", 0);
                resp.put("failed", 0);
                resp.put("message", "No students provided for publishing.");
                return ResponseEntity.badRequest().body(resp);
            }

            String className = request.getClassName();

            for (PublishedStudent item : request.getStudents()) {
                try {
                    // 1) fetch student from DB (authoritative)
                    Student student = studentRepository.findByStudentId(item.getStudentId())
                            .orElseThrow(() -> new RuntimeException("Student not found: " + item.getStudentId()));

                    String toEmail = resolveRecipientEmail(item, student);

                    // 2) fetch results for this student from DB
                    List<Result> studentResults =
                            resultRepository.findByStudentStudentId(student.getStudentId());

                    // 3) generate PDF bytes
                    byte[] pdfBytes = generateMarksPdf(student, className, studentResults);

                    // 4) email with attachment
                    sendEmailWithAttachment(
                            toEmail,
                            student.getName(),
                            className,
                            pdfBytes
                    );

                    success++;
                } catch (Exception ex) {
                    failed++;
                    String studentId = (item != null && item.getStudentId() != null) ? item.getStudentId() : "unknown";
                    String errorMessage = "Failed for studentId " + studentId + ": " + rootCauseMessage(ex);
                    errors.add(errorMessage);
                }
            }

            resp.put("className", request.getClassName());
            resp.put("success", success);
            resp.put("failed", failed);
            resp.put("totalAttempted", success + failed);
            resp.put("errors", errors);
            if (!errors.isEmpty()) {
                resp.put("firstError", errors.get(0));
            }

            if (failed > 0) {
                if (success == 0) {
                    resp.put("message", "Failed to send emails to all students. " + errors.get(0));
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
                }
                resp.put("message", "Emails sent to some students; some failed.");
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(resp);
            }

            resp.put("message", "Emails sent successfully to all students.");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", 0);
            resp.put("failed", 0);
            resp.put("message", "Publish failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/publish/diagnostics")
    public Map<String, Object> publishDiagnostics() {
        Map<String, Object> resp = new HashMap<>();
        boolean hasUsername = fromEmail != null && !fromEmail.trim().isEmpty();
        boolean hasPassword = mailPassword != null && !mailPassword.trim().isEmpty();
        resp.put("mailUsernameConfigured", hasUsername);
        resp.put("mailPasswordConfigured", hasPassword);
        resp.put("mailFrom", hasUsername ? fromEmail : "");
        resp.put("message", hasUsername && hasPassword
                ? "Mail credentials look configured."
                : "Mail credentials missing. Set SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD in Render env.");
        return resp;
    }

    private byte[] generateMarksPdf(Student student, String className, List<Result> studentResults) throws Exception {
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream content = new PDPageContentStream(document, page);

        float y = 760;

        // Title
        content.beginText();
        content.setFont(PDType1Font.HELVETICA_BOLD, 18);
        content.newLineAtOffset(50, y);
        content.showText("Student Marksheet");
        content.endText();

        y -= 30;

        // Student meta
        content.beginText();
        content.setFont(PDType1Font.HELVETICA, 12);
        content.newLineAtOffset(50, y);
        content.showText("Name: " + safe(student.getName()));
        content.endText();

        y -= 18;
        content.beginText();
        content.setFont(PDType1Font.HELVETICA, 12);
        content.newLineAtOffset(50, y);
        content.showText("Student ID: " + safe(student.getStudentId()));
        content.endText();

        y -= 18;
        content.beginText();
        content.setFont(PDType1Font.HELVETICA, 12);
        content.newLineAtOffset(50, y);
        content.showText("Class: " + safe(className));
        content.endText();

        y -= 25;

        // Header row
        content.beginText();
        content.setFont(PDType1Font.HELVETICA_BOLD, 12);
        content.newLineAtOffset(50, y);
        content.showText("Subject Code | Marks | Grade");
        content.endText();

        y -= 18;

        // Rows
        for (Result r : studentResults) {
            if (y < 60) break; // simple single-page limit

            String subjectCode = (r.getSubject() != null) ? safe(r.getSubject().getSubjectCode()) : "N/A";
            String marks = safe(String.valueOf(r.getMarks()));
            String grade = safe(String.valueOf(r.getGrade()));

            content.beginText();
            content.setFont(PDType1Font.HELVETICA, 11);
            content.newLineAtOffset(50, y);
            content.showText(subjectCode + " | " + marks + " | " + grade);
            content.endText();

            y -= 15;
        }

        content.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }

    private void sendEmailWithAttachment(String toEmail, String studentName, String className, byte[] pdfBytes) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        if (fromEmail != null && !fromEmail.trim().isEmpty()) {
            helper.setFrom(fromEmail.trim());
        }
        helper.setSubject("Your Results - " + safe(className));
        helper.setText(
                "Hello " + safe(studentName) + ",\n\n" +
                "Please find your marksheet attached as PDF.\n\n" +
                "Regards,\nSchool/College Admin",
                false
        );

        helper.addAttachment(
                "Marksheets_" + safe(className) + ".pdf",
                new ByteArrayResource(pdfBytes),
                "application/pdf"
        );

        javaMailSender.send(message);
    }

    private String resolveRecipientEmail(PublishedStudent item, Student student) {
        String dbEmail = student.getEmail();
        if (isValidEmail(dbEmail)) {
            return dbEmail.trim();
        }

        if (item != null && isValidEmail(item.getStudentEmail())) {
            return item.getStudentEmail().trim();
        }

        if (student.getUser() != null && isValidEmail(student.getUser().getUsername())) {
            return student.getUser().getUsername().trim();
        }

        throw new RuntimeException("No valid recipient email for studentId " + student.getStudentId());
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        try {
            InternetAddress address = new InternetAddress(email.trim());
            address.validate();
            return true;
        } catch (AddressException ex) {
            return false;
        }
    }

    private String rootCauseMessage(Throwable ex) {
        Throwable current = ex;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String msg = current.getMessage();
        return (msg == null || msg.isBlank()) ? current.getClass().getSimpleName() : msg;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}
