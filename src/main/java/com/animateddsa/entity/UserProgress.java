package com.animateddsa.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "question_id"})
})
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 20)
    private String status; // NOT_STARTED, IN_PROGRESS, SOLVED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;

    @Column(name = "last_attempted_at")
    private LocalDateTime lastAttemptedAt;

    @PrePersist
    protected void onCreate() {
        this.lastAttemptedAt = LocalDateTime.now();
        if (this.status == null) this.status = "IN_PROGRESS";
    }

    public UserProgress() {}

    public UserProgress(User user, Question question, String status) {
        this.user = user;
        this.question = question;
        this.status = status;
        this.lastAttemptedAt = LocalDateTime.now();
        if ("SOLVED".equalsIgnoreCase(status)) {
            this.solvedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getSolvedAt() { return solvedAt; }
    public void setSolvedAt(LocalDateTime solvedAt) { this.solvedAt = solvedAt; }

    public LocalDateTime getLastAttemptedAt() { return lastAttemptedAt; }
    public void setLastAttemptedAt(LocalDateTime lastAttemptedAt) { this.lastAttemptedAt = lastAttemptedAt; }
}
