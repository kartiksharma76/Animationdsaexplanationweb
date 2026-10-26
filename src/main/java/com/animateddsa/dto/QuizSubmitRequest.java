package com.animateddsa.dto;

import java.util.HashMap;
import java.util.Map;

public class QuizSubmitRequest {
    private Long quizId;
    private Map<Long, String> answers = new HashMap<>(); // questionId -> selectedOption ("A", "B", "C", "D")

    public QuizSubmitRequest() {}

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}
