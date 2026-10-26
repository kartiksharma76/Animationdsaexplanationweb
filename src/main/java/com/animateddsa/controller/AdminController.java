package com.animateddsa.controller;

import com.animateddsa.dto.QuestionCreateUpdateRequest;
import com.animateddsa.dto.QuestionDetailDto;
import com.animateddsa.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @PostMapping("/questions")
    public ResponseEntity<QuestionDetailDto> createQuestion(@RequestBody QuestionCreateUpdateRequest request) {
        QuestionDetailDto created = adminService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionDetailDto> updateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionCreateUpdateRequest request) {
        QuestionDetailDto updated = adminService.updateQuestion(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Map<String, Object>> deleteQuestion(@PathVariable Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully", "id", id));
    }
}
