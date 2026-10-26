package com.animateddsa.dto;

public class QuestionCreateUpdateRequest {
    private String title;
    private String slug;
    private String difficulty;
    private Long categoryId;
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

    public QuestionCreateUpdateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

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
}
