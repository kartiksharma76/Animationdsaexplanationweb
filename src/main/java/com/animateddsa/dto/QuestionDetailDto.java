package com.animateddsa.dto;

public class QuestionDetailDto {
    private Long id;
    private String slug;
    private String title;
    private String difficulty;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String categoryIcon;

    private String problemStatement;
    private String constraints;
    private String examplesJson;

    private String bruteForceApproach;
    private String bruteForceCode;
    private String bruteForceTime;
    private String bruteForceSpace;

    private String optimizedApproach;
    private String optimizedCode;
    private String optimizedTime;
    private String optimizedSpace;

    private String visualizerType;
    private String defaultInputJson;
    private String visualizationStepsJson;

    private String userStatus;

    @com.fasterxml.jackson.annotation.JsonProperty("isBookmarked")
    private boolean isBookmarked;
    private String userNotes;

    public QuestionDetailDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

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

    public String getUserStatus() { return userStatus; }
    public void setUserStatus(String userStatus) { this.userStatus = userStatus; }

    public boolean isBookmarked() { return isBookmarked; }
    public void setBookmarked(boolean bookmarked) { isBookmarked = bookmarked; }

    public String getUserNotes() { return userNotes; }
    public void setUserNotes(String userNotes) { this.userNotes = userNotes; }
}
