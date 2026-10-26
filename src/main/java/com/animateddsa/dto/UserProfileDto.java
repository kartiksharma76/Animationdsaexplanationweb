package com.animateddsa.dto;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Integer streakDays;
    private Integer totalSolved;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public UserProfileDto(Long id, String username, String email, String role, Integer streakDays, Integer totalSolved, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.streakDays = streakDays;
        this.totalSolved = totalSolved;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }

    public Integer getTotalSolved() { return totalSolved; }
    public void setTotalSolved(Integer totalSolved) { this.totalSolved = totalSolved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
