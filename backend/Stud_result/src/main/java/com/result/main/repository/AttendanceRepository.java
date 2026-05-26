package com.result.main.repository;

import com.result.main.entity.Attendance;
import com.result.main.entity.AttendanceStatus;
import com.result.main.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudentAndDate(Student student, LocalDate date);

    List<Attendance> findByStudentStudentIdAndDateBetween(String studentId, LocalDate start, LocalDate end);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:className IS NULL OR a.className = :className) AND " +
           "(:date IS NULL OR a.date = :date) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(a.student.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.student.studentId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Attendance> searchAttendance(
            @Param("className") String className,
            @Param("date") LocalDate date,
            @Param("status") AttendanceStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    long countPresentByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT a.className, COUNT(a) FROM Attendance a WHERE a.date BETWEEN :start AND :end GROUP BY a.className")
    List<Object[]> countByClassBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
