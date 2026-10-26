package com.animateddsa.service;

import com.animateddsa.dto.QuestionCreateUpdateRequest;
import com.animateddsa.dto.QuestionDetailDto;
import com.animateddsa.entity.Category;
import com.animateddsa.entity.Question;
import com.animateddsa.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionService questionService;

    public AdminService(QuestionRepository questionRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository,
                        QuizAttemptRepository quizAttemptRepository,
                        QuestionService questionService) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.questionService = questionService;
    }

    @Transactional
    public QuestionDetailDto createQuestion(QuestionCreateUpdateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));

        Question question = new Question();
        copyProperties(request, question, category);

        if (question.getSlug() == null || question.getSlug().trim().isEmpty()) {
            question.setSlug(generateSlug(question.getTitle()));
        }

        Question saved = questionRepository.save(question);
        return questionService.getQuestionById(saved.getId()).orElse(null);
    }

    @Transactional
    public QuestionDetailDto updateQuestion(Long id, QuestionCreateUpdateRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));

        copyProperties(request, question, category);
        Question saved = questionRepository.save(question);
        return questionService.getQuestionById(saved.getId()).orElse(null);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalQuizAttempts", quizAttemptRepository.count());
        return stats;
    }

    private void copyProperties(QuestionCreateUpdateRequest req, Question q, Category cat) {
        q.setTitle(req.getTitle());
        if (req.getSlug() != null && !req.getSlug().trim().isEmpty()) {
            q.setSlug(req.getSlug());
        }
        q.setDifficulty(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(req.getProblemStatement());
        q.setConstraints(req.getConstraints());
        q.setExamplesJson(req.getExamplesJson());
        q.setBruteForceApproach(req.getBruteForceApproach());
        q.setBruteForceCode(req.getBruteForceCode());
        q.setBruteForceTime(req.getBruteForceTime());
        q.setBruteForceSpace(req.getBruteForceSpace());
        q.setOptimizedApproach(req.getOptimizedApproach());
        q.setOptimizedCode(req.getOptimizedCode());
        q.setOptimizedTime(req.getOptimizedTime());
        q.setOptimizedSpace(req.getOptimizedSpace());
        q.setVisualizerType(req.getVisualizerType() != null ? req.getVisualizerType() : "ARRAY_TWO_POINTER");
        q.setDefaultInputJson(req.getDefaultInputJson());
        q.setVisualizationStepsJson(req.getVisualizationStepsJson());
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
}
