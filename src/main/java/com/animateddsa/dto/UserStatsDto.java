package com.animateddsa.dto;

import java.util.ArrayList;
import java.util.List;

public class UserStatsDto {
    private long totalSolved;
    private long totalQuestions;
    private int overallPercentage;

    private long easySolved;
    private long easyTotal;

    private long mediumSolved;
    private long mediumTotal;

    private long hardSolved;
    private long hardTotal;

    private int streakDays;
    private long totalQuizzesTaken;

    private List<CategoryProgressDto> categoryProgress = new ArrayList<>();

    public UserStatsDto() {}

    public long getTotalSolved() { return totalSolved; }
    public void setTotalSolved(long totalSolved) { this.totalSolved = totalSolved; }

    public long getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(long totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(int overallPercentage) { this.overallPercentage = overallPercentage; }

    public long getEasySolved() { return easySolved; }
    public void setEasySolved(long easySolved) { this.easySolved = easySolved; }

    public long getEasyTotal() { return easyTotal; }
    public void setEasyTotal(long easyTotal) { this.easyTotal = easyTotal; }

    public long getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(long mediumSolved) { this.mediumSolved = mediumSolved; }

    public long getMediumTotal() { return mediumTotal; }
    public void setMediumTotal(long mediumTotal) { this.mediumTotal = mediumTotal; }

    public long getHardSolved() { return hardSolved; }
    public void setHardSolved(long hardSolved) { this.hardSolved = hardSolved; }

    public long getHardTotal() { return hardTotal; }
    public void setHardTotal(long hardTotal) { this.hardTotal = hardTotal; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public long getTotalQuizzesTaken() { return totalQuizzesTaken; }
    public void setTotalQuizzesTaken(long totalQuizzesTaken) { this.totalQuizzesTaken = totalQuizzesTaken; }

    public List<CategoryProgressDto> getCategoryProgress() { return categoryProgress; }
    public void setCategoryProgress(List<CategoryProgressDto> categoryProgress) { this.categoryProgress = categoryProgress; }
}
