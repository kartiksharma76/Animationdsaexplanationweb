package com.animateddsa.controller;

import com.animateddsa.dto.QuizDto;
import com.animateddsa.dto.QuizResultDto;
import com.animateddsa.dto.QuizSubmitRequest;
import com.animateddsa.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public ResponseEntity<List<QuizDto>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-question/{questionId}")
    public ResponseEntity<?> getQuizByQuestion(@PathVariable Long questionId) {
        return quizService.getQuizByQuestionId(questionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(@RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }
}
