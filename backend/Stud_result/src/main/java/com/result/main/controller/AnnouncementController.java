package com.result.main.controller;

import com.result.main.entity.AnnouncementRead;
import com.result.main.entity.ExamNotification;
import com.result.main.entity.Role;
import com.result.main.entity.User;
import com.result.main.repository.AnnouncementReadRepository;
import com.result.main.repository.ExamNotificationRepository;
import com.result.main.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final ExamNotificationRepository notificationRepository;
    private final AnnouncementReadRepository readRepository;
    private final UserRepository userRepository;

    public AnnouncementController(ExamNotificationRepository notificationRepository,
                                  AnnouncementReadRepository readRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.readRepository = readRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/unread-popup")
    public ResponseEntity<List<Map<String, Object>>> getUnreadPopups(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Unauthorized"));

        Role role = user.getRole();
        if (role == Role.ADMIN) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String roleStr = role.name();
        List<Long> readIds = readRepository.findReadAnnouncementIdsByUserId(user.getId());
        List<ExamNotification> notifications;
        if (readIds.isEmpty()) {
            notifications = notificationRepository.findAllForRole(roleStr);
        } else {
            notifications = notificationRepository.findUnreadForRole(roleStr, readIds);
        }

        List<Map<String, Object>> response = notifications.stream().map(n -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", n.getId());
            m.put("title", n.getTitle());
            m.put("message", n.getMessage());
            m.put("targetRole", n.getTargetRole());
            m.put("examId", n.getExam() != null ? n.getExam().getId() : null);
            m.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable("id") Long announcementId, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Unauthorized"));

        ExamNotification announcement = notificationRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found"));

        Optional<AnnouncementRead> existing = readRepository.findByAnnouncementIdAndUserId(announcementId, user.getId());
        if (existing.isEmpty()) {
            AnnouncementRead readRecord = new AnnouncementRead(announcement, user, user.getRole());
            readRepository.save(readRecord);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Announcement marked as read");
        return ResponseEntity.ok(response);
    }
}
