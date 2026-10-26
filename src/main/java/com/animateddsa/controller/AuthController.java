package com.animateddsa.controller;

import com.animateddsa.dto.AuthResponse;
import com.animateddsa.dto.LoginRequest;
import com.animateddsa.dto.RegisterRequest;
import com.animateddsa.dto.UserProfileDto;
import com.animateddsa.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty() ||
                registerRequest.getPassword() == null || registerRequest.getPassword().trim().length() < 4) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username and password (min 4 chars) are required."));
            }

            AuthResponse response = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        UserProfileDto profile = authService.getCurrentUserProfile();
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(profile);
    }
}
