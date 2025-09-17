package com.pastebin.controller;

import com.pastebin.dto.AuthResponse;
import com.pastebin.service.AuthService;
import com.pastebin.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final JwtService jwtService;
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            if (jwtService.isTokenValid(token)) {
                String userId = jwtService.extractUserId(token);
                String email = jwtService.extractEmail(token);
                
                return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "userId", userId,
                    "email", email
                ));
            }
        } catch (Exception e) {
            // Token is invalid
        }
        
        return ResponseEntity.ok(Map.of("authenticated", false));
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        authService.logout(refreshToken);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
