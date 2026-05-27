package com.result.main.service;

import com.result.main.entity.AuditLog;
import com.result.main.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void log(String action, String performedBy, String role, String targetEntity, String description, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setPerformedBy(performedBy != null ? performedBy : "SYSTEM");
        log.setRole(role != null ? role : "SYSTEM");
        log.setTargetEntity(targetEntity);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    @Async
    public void log(String action, String performedBy, String role, String targetEntity, String description) {
        log(action, performedBy, role, targetEntity, description, resolveClientIp());
    }

    public Page<AuditLog> search(String search, String action, String role, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.search(
                emptyToNull(search),
                emptyToNull(action),
                emptyToNull(role),
                pageable
        );
    }

    public String resolveClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }

    private String emptyToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}
