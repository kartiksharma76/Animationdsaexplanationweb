package com.animateddsa.dto;

public class CategoryProgressDto {
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String categoryIcon;
    private long solvedCount;
    private long totalCount;
    private int completionPercentage;

    public CategoryProgressDto() {}

    public CategoryProgressDto(Long categoryId, String categoryName, String categorySlug, String categoryIcon, long solvedCount, long totalCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
        this.categoryIcon = categoryIcon;
        this.solvedCount = solvedCount;
        this.totalCount = totalCount;
        this.completionPercentage = totalCount > 0 ? (int) Math.round((solvedCount * 100.0) / totalCount) : 0;
    }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

    public long getSolvedCount() { return solvedCount; }
    public void setSolvedCount(long solvedCount) { this.solvedCount = solvedCount; }

    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }

    public int getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(int completionPercentage) { this.completionPercentage = completionPercentage; }
}
