package com.animateddsa.controller;

import com.animateddsa.dto.ProgressUpdateRequest;
import com.animateddsa.dto.UserStatsDto;
import com.animateddsa.entity.UserProgress;
import com.animateddsa.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDto> getUserStats() {
        return ResponseEntity.ok(progressService.getUserStats());
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<UserProgress> updateProgress(
            @PathVariable Long questionId,
            @RequestBody ProgressUpdateRequest request) {
        return ResponseEntity.ok(progressService.updateProgress(questionId, request));
    }
}
