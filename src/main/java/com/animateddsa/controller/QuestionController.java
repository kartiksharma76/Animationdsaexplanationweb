package com.animateddsa.controller;

import com.animateddsa.dto.QuestionCreateUpdateRequest;
import com.animateddsa.dto.QuestionDetailDto;
import com.animateddsa.dto.QuestionSummaryDto;
import com.animateddsa.service.AdminService;
import com.animateddsa.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final AdminService adminService;

    public QuestionController(QuestionService questionService, AdminService adminService) {
        this.questionService = questionService;
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<QuestionDetailDto> createQuestion(@RequestBody QuestionCreateUpdateRequest request) {
        QuestionDetailDto created = adminService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<QuestionSummaryDto>> getQuestions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(questionService.getQuestions(categoryId, difficulty, search));
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<?> getQuestion(@PathVariable String idOrSlug) {
        Optional<QuestionDetailDto> question;
        try {
            Long id = Long.parseLong(idOrSlug);
            question = questionService.getQuestionById(id);
        } catch (NumberFormatException e) {
            question = questionService.getQuestionBySlug(idOrSlug);
        }

        return question.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
