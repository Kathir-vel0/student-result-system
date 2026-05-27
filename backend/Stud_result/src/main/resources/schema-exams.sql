-- Exam Management System schema (MySQL)
-- Hibernate ddl-auto=update will create these automatically; use this for manual setup.

CREATE TABLE IF NOT EXISTS exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    exam_type VARCHAR(100),
    class_name VARCHAR(100),
    section VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(100),
    published BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS exam_subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    max_marks INT DEFAULT 100,
    pass_marks INT DEFAULT 35,
    room_number VARCHAR(50),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS exam_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    marks_obtained INT,
    grade VARCHAR(10),
    remarks TEXT,
    entered_by VARCHAR(100),
    published BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    UNIQUE KEY uk_exam_student_subject (exam_id, student_id, subject_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS exam_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    target_role VARCHAR(20),
    exam_id BIGINT,
    created_at DATETIME,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    read_at DATETIME NOT NULL,
    UNIQUE KEY uk_announcement_user (announcement_id, user_id),
    FOREIGN KEY (announcement_id) REFERENCES exam_notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

