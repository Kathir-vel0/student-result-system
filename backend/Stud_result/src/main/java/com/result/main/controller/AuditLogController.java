package com.result.main.controller;

import com.result.main.dto.PageResponse;
import com.result.main.entity.AuditLog;
import com.result.main.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditService auditService;

    public AuditLogController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<AuditLog>> page(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AuditLog> result = auditService.search(search, action, role, page, size);
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(), page, size, result.getTotalElements()));
    }
}
