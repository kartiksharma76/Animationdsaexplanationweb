package com.animateddsa.controller;

import com.animateddsa.dto.QuestionSummaryDto;
import com.animateddsa.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    public ResponseEntity<List<QuestionSummaryDto>> getUserBookmarks() {
        return ResponseEntity.ok(bookmarkService.getUserBookmarks());
    }

    @PostMapping("/{questionId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleBookmark(@PathVariable Long questionId) {
        boolean bookmarked = bookmarkService.toggleBookmark(questionId);
        return ResponseEntity.ok(Map.of("questionId", questionId, "bookmarked", bookmarked));
    }
}
