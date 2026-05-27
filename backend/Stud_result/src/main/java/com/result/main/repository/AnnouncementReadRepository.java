package com.result.main.repository;

import com.result.main.entity.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {

    Optional<AnnouncementRead> findByAnnouncementIdAndUserId(Long announcementId, Long userId);

    @Query("SELECT r.announcement.id FROM AnnouncementRead r WHERE r.user.id = :userId")
    List<Long> findReadAnnouncementIdsByUserId(@Param("userId") Long userId);
}
