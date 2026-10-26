package com.animateddsa.service;

import com.animateddsa.dto.CategoryProgressDto;
import com.animateddsa.dto.ProgressUpdateRequest;
import com.animateddsa.dto.UserStatsDto;
import com.animateddsa.entity.Category;
import com.animateddsa.entity.Question;
import com.animateddsa.entity.User;
import com.animateddsa.entity.UserProgress;
import com.animateddsa.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final UserProgressRepository userProgressRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AuthService authService;

    public ProgressService(UserProgressRepository userProgressRepository,
                           QuestionRepository questionRepository,
                           CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           QuizAttemptRepository quizAttemptRepository,
                           AuthService authService) {
        this.userProgressRepository = userProgressRepository;
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.authService = authService;
    }

    @Transactional
    public UserProgress updateProgress(Long questionId, ProgressUpdateRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required to update progress");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        UserProgress progress = userProgressRepository.findByUserAndQuestion(currentUser, question)
                .orElse(new UserProgress(currentUser, question, request.getStatus()));

        String oldStatus = progress.getStatus();
        progress.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            progress.setNotes(request.getNotes());
        }
        progress.setLastAttemptedAt(LocalDateTime.now());

        if ("SOLVED".equalsIgnoreCase(request.getStatus())) {
            progress.setSolvedAt(LocalDateTime.now());
        }

        UserProgress saved = userProgressRepository.save(progress);

        // Recalculate total solved for user if status changed to SOLVED
        long solvedCount = userProgressRepository.countByUserAndStatus(currentUser, "SOLVED");
        currentUser.setTotalSolved((int) solvedCount);
        userRepository.save(currentUser);

        return saved;
    }

    public UserStatsDto getUserStats() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return new UserStatsDto();
        }

        long totalQuestions = questionRepository.count();
        long easyTotal = questionRepository.countByDifficulty("EASY");
        long mediumTotal = questionRepository.countByDifficulty("MEDIUM");
        long hardTotal = questionRepository.countByDifficulty("HARD");

        List<UserProgress> userProgressList = userProgressRepository.findAllByUser(currentUser);
        Map<Long, String> questionStatusMap = userProgressList.stream()
                .filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toMap(p -> p.getQuestion().getId(), UserProgress::getStatus, (a, b) -> a));

        List<Question> allQuestions = questionRepository.findAll();
        long easySolved = 0;
        long mediumSolved = 0;
        long hardSolved = 0;

        for (Question q : allQuestions) {
            if (questionStatusMap.containsKey(q.getId())) {
                if ("EASY".equalsIgnoreCase(q.getDifficulty())) easySolved++;
                else if ("MEDIUM".equalsIgnoreCase(q.getDifficulty())) mediumSolved++;
                else if ("HARD".equalsIgnoreCase(q.getDifficulty())) hardSolved++;
            }
        }

        long totalSolved = easySolved + mediumSolved + hardSolved;
        int overallPercentage = totalQuestions > 0 ? (int) Math.round((totalSolved * 100.0) / totalQuestions) : 0;

        UserStatsDto stats = new UserStatsDto();
        stats.setTotalSolved(totalSolved);
        stats.setTotalQuestions(totalQuestions);
        stats.setOverallPercentage(overallPercentage);
        stats.setEasySolved(easySolved);
        stats.setEasyTotal(easyTotal);
        stats.setMediumSolved(mediumSolved);
        stats.setMediumTotal(mediumTotal);
        stats.setHardSolved(hardSolved);
        stats.setHardTotal(hardTotal);
        stats.setStreakDays(currentUser.getStreakDays() != null ? currentUser.getStreakDays() : 1);
        stats.setTotalQuizzesTaken(quizAttemptRepository.countByUser(currentUser));

        // Category-level breakdown
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();
        List<CategoryProgressDto> categoryProgressList = new ArrayList<>();

        for (Category cat : categories) {
            long catTotal = questionRepository.countByCategoryId(cat.getId());
            long catSolved = allQuestions.stream()
                    .filter(q -> q.getCategory().getId().equals(cat.getId()) && questionStatusMap.containsKey(q.getId()))
                    .count();
            categoryProgressList.add(new CategoryProgressDto(
                    cat.getId(),
                    cat.getName(),
                    cat.getSlug(),
                    cat.getIcon(),
                    catSolved,
                    catTotal
            ));
        }

        stats.setCategoryProgress(categoryProgressList);
        return stats;
    }
}
