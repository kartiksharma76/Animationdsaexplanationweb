package com.animateddsa.service;

import com.animateddsa.dto.QuestionDetailDto;
import com.animateddsa.dto.QuestionSummaryDto;
import com.animateddsa.entity.Bookmark;
import com.animateddsa.entity.Question;
import com.animateddsa.entity.User;
import com.animateddsa.entity.UserProgress;
import com.animateddsa.repository.BookmarkRepository;
import com.animateddsa.repository.QuestionRepository;
import com.animateddsa.repository.UserProgressRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserProgressRepository userProgressRepository;
    private final BookmarkRepository bookmarkRepository;
    private final AuthService authService;

    public QuestionService(QuestionRepository questionRepository,
                           UserProgressRepository userProgressRepository,
                           BookmarkRepository bookmarkRepository,
                           AuthService authService) {
        this.questionRepository = questionRepository;
        this.userProgressRepository = userProgressRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.authService = authService;
    }

    public List<QuestionSummaryDto> getQuestions(Long categoryId, String difficulty, String search) {
        List<Question> questions = questionRepository.filterQuestions(categoryId, difficulty, search);
        User currentUser = authService.getCurrentAuthenticatedUser();

        Map<Long, String> progressMap = Map.of();
        Map<Long, Boolean> bookmarkMap = Map.of();

        if (currentUser != null) {
            List<UserProgress> progresses = userProgressRepository.findAllByUser(currentUser);
            progressMap = progresses.stream()
                    .collect(Collectors.toMap(p -> p.getQuestion().getId(), UserProgress::getStatus, (a, b) -> a));

            List<Bookmark> bookmarks = bookmarkRepository.findAllByUserOrderByCreatedAtDesc(currentUser);
            bookmarkMap = bookmarks.stream()
                    .collect(Collectors.toMap(b -> b.getQuestion().getId(), b -> true, (a, b) -> a));
        }

        final Map<Long, String> finalProgressMap = progressMap;
        final Map<Long, Boolean> finalBookmarkMap = bookmarkMap;

        return questions.stream().map(q -> {
            QuestionSummaryDto dto = new QuestionSummaryDto();
            dto.setId(q.getId());
            dto.setSlug(q.getSlug());
            dto.setTitle(q.getTitle());
            dto.setDifficulty(q.getDifficulty());
            dto.setCategoryId(q.getCategory().getId());
            dto.setCategoryName(q.getCategory().getName());
            dto.setCategorySlug(q.getCategory().getSlug());
            dto.setCategoryIcon(q.getCategory().getIcon());
            dto.setVisualizerType(q.getVisualizerType());
            dto.setUserStatus(finalProgressMap.getOrDefault(q.getId(), "NOT_STARTED"));
            dto.setBookmarked(finalBookmarkMap.getOrDefault(q.getId(), false));
            return dto;
        }).collect(Collectors.toList());
    }

    public Optional<QuestionDetailDto> getQuestionBySlug(String slug) {
        return questionRepository.findBySlug(slug).map(this::convertToDetailDto);
    }

    public Optional<QuestionDetailDto> getQuestionById(Long id) {
        return questionRepository.findById(id).map(this::convertToDetailDto);
    }

    private QuestionDetailDto convertToDetailDto(Question q) {
        QuestionDetailDto dto = new QuestionDetailDto();
        dto.setId(q.getId());
        dto.setSlug(q.getSlug());
        dto.setTitle(q.getTitle());
        dto.setDifficulty(q.getDifficulty());

        if (q.getCategory() != null) {
            dto.setCategoryId(q.getCategory().getId());
            dto.setCategoryName(q.getCategory().getName());
            dto.setCategorySlug(q.getCategory().getSlug());
            dto.setCategoryIcon(q.getCategory().getIcon());
        }

        dto.setProblemStatement(q.getProblemStatement());
        dto.setConstraints(q.getConstraints());
        dto.setExamplesJson(q.getExamplesJson());

        dto.setBruteForceApproach(q.getBruteForceApproach());
        dto.setBruteForceCode(q.getBruteForceCode());
        dto.setBruteForceTime(q.getBruteForceTime());
        dto.setBruteForceSpace(q.getBruteForceSpace());

        dto.setOptimizedApproach(q.getOptimizedApproach());
        dto.setOptimizedCode(q.getOptimizedCode());
        dto.setOptimizedTime(q.getOptimizedTime());
        dto.setOptimizedSpace(q.getOptimizedSpace());

        dto.setVisualizerType(q.getVisualizerType());
        dto.setDefaultInputJson(q.getDefaultInputJson());
        dto.setVisualizationStepsJson(q.getVisualizationStepsJson());

        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser != null) {
            Optional<UserProgress> progress = userProgressRepository.findByUserAndQuestion(currentUser, q);
            if (progress.isPresent()) {
                dto.setUserStatus(progress.get().getStatus());
                dto.setUserNotes(progress.get().getNotes());
            } else {
                dto.setUserStatus("NOT_STARTED");
            }
            dto.setBookmarked(bookmarkRepository.existsByUserAndQuestion(currentUser, q));
        } else {
            dto.setUserStatus("NOT_STARTED");
            dto.setBookmarked(false);
        }

        return dto;
    }
}
