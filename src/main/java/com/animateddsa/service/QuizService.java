package com.animateddsa.service;

import com.animateddsa.dto.*;
import com.animateddsa.entity.Quiz;
import com.animateddsa.entity.QuizAttempt;
import com.animateddsa.entity.QuizQuestion;
import com.animateddsa.entity.User;
import com.animateddsa.repository.QuizAttemptRepository;
import com.animateddsa.repository.QuizQuestionRepository;
import com.animateddsa.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AuthService authService;

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       AuthService authService) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.authService = authService;
    }

    public List<QuizDto> getAllQuizzes() {
        return quizRepository.findAll().stream().map(this::convertToDtoWithoutAnswers).collect(Collectors.toList());
    }

    public Optional<QuizDto> getQuizById(Long id) {
        return quizRepository.findById(id).map(this::convertToDtoWithoutAnswers);
    }

    public Optional<QuizDto> getQuizByQuestionId(Long questionId) {
        return quizRepository.findByQuestionId(questionId).map(this::convertToDtoWithoutAnswers);
    }

    @Transactional
    public QuizResultDto submitQuiz(QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + request.getQuizId()));

        User currentUser = authService.getCurrentAuthenticatedUser();

        List<QuizQuestion> questions = quiz.getQuestions();
        int score = 0;
        int total = questions.size();
        List<QuizQuestionDto> reviewedQuestions = new ArrayList<>();

        Map<Long, String> userAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();

        for (QuizQuestion q : questions) {
            String selected = userAnswers.get(q.getId());
            boolean isCorrect = selected != null && selected.equalsIgnoreCase(q.getCorrectOption());
            if (isCorrect) {
                score++;
            }

            QuizQuestionDto dto = new QuizQuestionDto();
            dto.setId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setOptionA(q.getOptionA());
            dto.setOptionB(q.getOptionB());
            dto.setOptionC(q.getOptionC());
            dto.setOptionD(q.getOptionD());
            dto.setCorrectOption(q.getCorrectOption());
            dto.setExplanation(q.getExplanation());
            dto.setSelectedOption(selected != null ? selected.toUpperCase() : "");
            dto.setCorrect(isCorrect);

            reviewedQuestions.add(dto);
        }

        int percentage = total > 0 ? (int) Math.round((score * 100.0) / total) : 0;

        if (currentUser != null) {
            QuizAttempt attempt = new QuizAttempt(currentUser, quiz, score, total);
            quizAttemptRepository.save(attempt);
        }

        String feedback;
        if (percentage >= 80) {
            feedback = "Mastery Achieved! Outstanding algorithmic reasoning.";
        } else if (percentage >= 50) {
            feedback = "Good Effort! Review the dry run steps and complexity analysis to level up.";
        } else {
            feedback = "Keep Practicing! Step through the interactive animation once more to solidify the concepts.";
        }

        QuizResultDto result = new QuizResultDto();
        result.setQuizId(quiz.getId());
        result.setQuizTitle(quiz.getTitle());
        result.setScore(score);
        result.setTotalQuestions(total);
        result.setPercentage(percentage);
        result.setFeedback(feedback);
        result.setQuestions(reviewedQuestions);

        return result;
    }

    private QuizDto convertToDtoWithoutAnswers(Quiz quiz) {
        QuizDto dto = new QuizDto();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());

        if (quiz.getCategory() != null) {
            dto.setCategoryId(quiz.getCategory().getId());
            dto.setCategoryName(quiz.getCategory().getName());
        }

        if (quiz.getQuestion() != null) {
            dto.setQuestionId(quiz.getQuestion().getId());
            dto.setQuestionTitle(quiz.getQuestion().getTitle());
        }

        List<QuizQuestionDto> qDtos = quiz.getQuestions().stream().map(q -> {
            QuizQuestionDto qDto = new QuizQuestionDto();
            qDto.setId(q.getId());
            qDto.setQuestionText(q.getQuestionText());
            qDto.setOptionA(q.getOptionA());
            qDto.setOptionB(q.getOptionB());
            qDto.setOptionC(q.getOptionC());
            qDto.setOptionD(q.getOptionD());
            // Hide correct option and explanation until submitted
            return qDto;
        }).collect(Collectors.toList());

        dto.setQuestions(qDtos);
        dto.setTotalQuestions(qDtos.size());
        return dto;
    }
}
