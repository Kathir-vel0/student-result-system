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
                // Public authentication and student self-registration
                .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // Public student register route
                
                // Allow error endpoints
                .requestMatchers("/error").permitAll()
                
                // ADMIN ONLY actions (Admin Panel for Teachers)
                .requestMatchers("/api/teachers/create-full").hasRole("ADMIN")
                .requestMatchers("/api/teachers/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/teachers/update/**").hasRole("ADMIN")
                .requestMatchers("/api/teachers/add").hasRole("ADMIN")
                .requestMatchers("/api/users/admin/reset-password").hasRole("ADMIN")
                .requestMatchers("/api/users/admin/**").hasRole("ADMIN")
                
                // Teacher list is Admin only (except profile fetching)
                .requestMatchers(HttpMethod.GET, "/api/teachers/all").hasRole("ADMIN")
                
                // Profile endpoints (Any authenticated user can fetch their own profile)
                .requestMatchers("/api/teachers/user/**").hasAnyRole("TEACHER", "ADMIN")
                .requestMatchers("/api/students/user/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                
                // Subject management (Admin only)
                .requestMatchers("/api/subjects/add").hasRole("ADMIN")
                .requestMatchers("/api/subjects/delete/**").hasRole("ADMIN")
                .requestMatchers("/api/subjects/all").hasAnyRole("ADMIN", "TEACHER")
                
                // Student management
                .requestMatchers("/api/students").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/students/user/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                
                // Results endpoints
                .requestMatchers(HttpMethod.POST, "/api/results/add").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/results/update/**").hasRole("TEACHER")
                .requestMatchers("/api/results/student/**").hasAnyRole("STUDENT", "ADMIN", "TEACHER")
                .requestMatchers("/api/results/all").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/results/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                
                // Default fallback
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
