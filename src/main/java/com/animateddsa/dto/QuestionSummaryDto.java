package com.animateddsa.dto;

public class QuestionSummaryDto {
    private Long id;
    private String slug;
    private String title;
    private String difficulty;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String categoryIcon;
    private String visualizerType;
    private String userStatus; // NOT_STARTED, IN_PROGRESS, SOLVED

    @com.fasterxml.jackson.annotation.JsonProperty("isBookmarked")
    private boolean isBookmarked;

    public QuestionSummaryDto() {}

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

    public String getVisualizerType() { return visualizerType; }
    public void setVisualizerType(String visualizerType) { this.visualizerType = visualizerType; }

    public String getUserStatus() { return userStatus; }
    public void setUserStatus(String userStatus) { this.userStatus = userStatus; }

    public boolean isBookmarked() { return isBookmarked; }
    public void setBookmarked(boolean bookmarked) { isBookmarked = bookmarked; }
}
