package com.animateddsa.service;

import com.animateddsa.dto.QuestionSummaryDto;
import com.animateddsa.entity.Bookmark;
import com.animateddsa.entity.Question;
import com.animateddsa.entity.User;
import com.animateddsa.entity.UserProgress;
import com.animateddsa.repository.BookmarkRepository;
import com.animateddsa.repository.QuestionRepository;
import com.animateddsa.repository.UserProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final QuestionRepository questionRepository;
    private final UserProgressRepository userProgressRepository;
    private final AuthService authService;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           QuestionRepository questionRepository,
                           UserProgressRepository userProgressRepository,
                           AuthService authService) {
        this.bookmarkRepository = bookmarkRepository;
        this.questionRepository = questionRepository;
        this.userProgressRepository = userProgressRepository;
        this.authService = authService;
    }

    @Transactional
    public boolean toggleBookmark(Long questionId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required to bookmark questions");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        Optional<Bookmark> existing = bookmarkRepository.findByUserAndQuestion(currentUser, question);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return false;
        } else {
            Bookmark bookmark = new Bookmark(currentUser, question);
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    public List<QuestionSummaryDto> getUserBookmarks() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return List.of();
        }

        List<Bookmark> bookmarks = bookmarkRepository.findAllByUserOrderByCreatedAtDesc(currentUser);
        List<UserProgress> userProgressList = userProgressRepository.findAllByUser(currentUser);
        Map<Long, String> progressMap = userProgressList.stream()
                .collect(Collectors.toMap(p -> p.getQuestion().getId(), UserProgress::getStatus, (a, b) -> a));

        return bookmarks.stream().map(b -> {
            Question q = b.getQuestion();
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
            dto.setUserStatus(progressMap.getOrDefault(q.getId(), "NOT_STARTED"));
            dto.setBookmarked(true);
            return dto;
        }).collect(Collectors.toList());
    }
}
