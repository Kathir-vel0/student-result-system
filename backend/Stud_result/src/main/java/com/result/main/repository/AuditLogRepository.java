package com.result.main.repository;

import com.result.main.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.targetEntity) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
           "(:role IS NULL OR :role = '' OR a.role = :role)")
    Page<AuditLog> search(
            @Param("search") String search,
            @Param("action") String action,
            @Param("role") String role,
            Pageable pageable);
}
