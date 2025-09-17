package com.pastebin.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pastebin.dto.AuthResponse;
import com.pastebin.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;

@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final AuthService authService;
    private final ObjectMapper objectMapper;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        AuthResponse authResponse = authService.processOAuth2User(oAuth2User);
        
        // Store tokens in localStorage via URL parameters (for frontend to pick up)
        String redirectUrl = "http://localhost:3000/login-success?" +
                           "accessToken=" + URLEncoder.encode(authResponse.getAccessToken(), "UTF-8") +
                           "&refreshToken=" + URLEncoder.encode(authResponse.getRefreshToken(), "UTF-8") +
                           "&user=" + URLEncoder.encode(objectMapper.writeValueAsString(authResponse.getUser()), "UTF-8");
        
        response.sendRedirect(redirectUrl);
    }
}