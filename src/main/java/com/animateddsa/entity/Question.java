package com.animateddsa.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 20)
    private String difficulty; // EASY, MEDIUM, HARD

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "problem_statement", columnDefinition = "LONGTEXT", nullable = false)
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "examples_json", columnDefinition = "LONGTEXT")
    private String examplesJson;

    @Column(name = "brute_force_approach", columnDefinition = "LONGTEXT")
    private String bruteForceApproach;

    @Column(name = "brute_force_code", columnDefinition = "LONGTEXT")
    private String bruteForceCode;

    @Column(name = "brute_force_time", length = 50)
    private String bruteForceTime;

    @Column(name = "brute_force_space", length = 50)
    private String bruteForceSpace;

    @Column(name = "optimized_approach", columnDefinition = "LONGTEXT")
    private String optimizedApproach;

    @Column(name = "optimized_code", columnDefinition = "LONGTEXT")
    private String optimizedCode;

    @Column(name = "optimized_time", length = 50)
    private String optimizedTime;

    @Column(name = "optimized_space", length = 50)
    private String optimizedSpace;

    @Column(name = "visualizer_type", length = 50)
    private String visualizerType;

    @Column(name = "default_input_json", columnDefinition = "TEXT")
    private String defaultInputJson;

    @Column(name = "visualization_steps_json", columnDefinition = "LONGTEXT")
    private String visualizationStepsJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.difficulty == null) this.difficulty = "MEDIUM";
        if (this.visualizerType == null) this.visualizerType = "ARRAY_TWO_POINTER";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Question() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public String getExamplesJson() { return examplesJson; }
    public void setExamplesJson(String examplesJson) { this.examplesJson = examplesJson; }

    public String getBruteForceApproach() { return bruteForceApproach; }
    public void setBruteForceApproach(String bruteForceApproach) { this.bruteForceApproach = bruteForceApproach; }

    public String getBruteForceCode() { return bruteForceCode; }
    public void setBruteForceCode(String bruteForceCode) { this.bruteForceCode = bruteForceCode; }

    public String getBruteForceTime() { return bruteForceTime; }
    public void setBruteForceTime(String bruteForceTime) { this.bruteForceTime = bruteForceTime; }

    public String getBruteForceSpace() { return bruteForceSpace; }
    public void setBruteForceSpace(String bruteForceSpace) { this.bruteForceSpace = bruteForceSpace; }

    public String getOptimizedApproach() { return optimizedApproach; }
    public void setOptimizedApproach(String optimizedApproach) { this.optimizedApproach = optimizedApproach; }

    public String getOptimizedCode() { return optimizedCode; }
    public void setOptimizedCode(String optimizedCode) { this.optimizedCode = optimizedCode; }

    public String getOptimizedTime() { return optimizedTime; }
    public void setOptimizedTime(String optimizedTime) { this.optimizedTime = optimizedTime; }

    public String getOptimizedSpace() { return optimizedSpace; }
    public void setOptimizedSpace(String optimizedSpace) { this.optimizedSpace = optimizedSpace; }

    public String getVisualizerType() { return visualizerType; }
    public void setVisualizerType(String visualizerType) { this.visualizerType = visualizerType; }

    public String getDefaultInputJson() { return defaultInputJson; }
    public void setDefaultInputJson(String defaultInputJson) { this.defaultInputJson = defaultInputJson; }

    public String getVisualizationStepsJson() { return visualizationStepsJson; }
    public void setVisualizationStepsJson(String visualizationStepsJson) { this.visualizationStepsJson = visualizationStepsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
