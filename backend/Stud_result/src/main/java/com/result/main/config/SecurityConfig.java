package com.result.main.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/error").permitAll()

                // Admin only
                .requestMatchers("/api/teachers/create-full").hasRole("ADMIN")
                .requestMatchers("/api/teachers/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/teachers/update/**").hasRole("ADMIN")
                .requestMatchers("/api/teachers/add").hasRole("ADMIN")
                .requestMatchers("/api/users/admin/reset-password").hasRole("ADMIN")
                .requestMatchers("/api/users/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/teachers/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                .requestMatchers("/api/subjects/add").hasRole("ADMIN")
                .requestMatchers("/api/subjects/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/admin").hasRole("ADMIN")
                .requestMatchers("/api/audit/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/results/publish").hasRole("ADMIN")

                // Exam management — admin
                .requestMatchers(HttpMethod.POST, "/api/exams").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/exams/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/exams/*/publish").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/exams/notifications").hasRole("ADMIN")
                .requestMatchers("/api/exams/analytics/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/exams/page").hasAnyRole("ADMIN", "TEACHER")

                // Exam — teacher
                .requestMatchers(HttpMethod.POST, "/api/exams/marks").hasRole("TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/exams/*/submit-review").hasRole("TEACHER")
                .requestMatchers("/api/exams/teacher/**").hasRole("TEACHER")
                .requestMatchers("/api/exams/analytics/teacher").hasRole("TEACHER")
                .requestMatchers("/api/exams/*/marks").hasAnyRole("ADMIN", "TEACHER")

                // Exam — student (published only enforced in service)
                .requestMatchers("/api/exams/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/exams/analytics/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/exams/timetable").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                .requestMatchers("/api/exams/notifications").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/exams/**").authenticated()
                .requestMatchers("/api/teachers/page").hasRole("ADMIN")
                // Attendance — role-scoped (order: specific before broad)
                .requestMatchers("/api/attendance/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/attendance/mark", "/api/attendance/bulk").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/attendance/page", "/api/attendance/analytics").hasAnyRole("ADMIN", "TEACHER")

                // Teacher
                .requestMatchers(HttpMethod.POST, "/api/results/add").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/results/update/**").hasRole("TEACHER")
                .requestMatchers("/api/analytics/teacher").hasRole("TEACHER")
                .requestMatchers("/api/teachers/subjects").hasRole("TEACHER")
                .requestMatchers("/api/teachers/dashboard-stats").hasRole("TEACHER")

                // Student
                .requestMatchers("/api/analytics/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/analytics/report-card/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                // Shared authenticated
                .requestMatchers("/api/teachers/user/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/students/user/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/subjects/all").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/students").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/students/user/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/students/page").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/results/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/results/all").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/results/page").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/results/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/subjects/page").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
