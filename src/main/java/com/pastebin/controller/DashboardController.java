package com.pastebin.controller;

import com.pastebin.model.enums.Visibility;
import com.pastebin.repository.PasteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final PasteRepository pasteRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestAttribute("userId") String userId) {
        long totalPastes = pasteRepository.countByUserId(userId);
        long publicPastes = pasteRepository.countByUserIdAndVisibility(userId, Visibility.PUBLIC);
        long privatePastes = pasteRepository.countByUserIdAndVisibility(userId, Visibility.PRIVATE);
        long customPastes = pasteRepository.countByUserIdAndVisibility(userId, Visibility.CUSTOM);
        
        Map<String, Object> stats = Map.of(
            "totalPastes", totalPastes,
            "publicPastes", publicPastes,
            "privatePastes", privatePastes,
            "customPastes", customPastes
        );
        
        return ResponseEntity.ok(Map.of("userStats", stats));
    }
}
