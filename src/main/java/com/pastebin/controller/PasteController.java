package com.pastebin.controller;

import com.pastebin.dto.CreatePasteRequest;
import com.pastebin.dto.PasteResponse;
import com.pastebin.service.PasteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paste")
@RequiredArgsConstructor
public class PasteController {
    
    private final PasteService pasteService;
    
    @PostMapping("/new-paste")
    public ResponseEntity<PasteResponse> createPaste(@RequestBody CreatePasteRequest request,
                                                   @RequestAttribute(value = "userId", required = false) String userId) {
        PasteResponse response = pasteService.createPaste(request, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/get-presigned-upload-url")
    public ResponseEntity<Map<String, String>> getPresignedUploadUrl(@RequestBody CreatePasteRequest request,
                                                                   @RequestAttribute(value = "userId", required = false) String userId) {
        Map<String, String> response = pasteService.getPresignedUploadUrl(request, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/get-paste/{pasteId}")
    public ResponseEntity<PasteResponse> getPaste(@PathVariable String pasteId,
                                                @RequestAttribute(value = "userId", required = false) String userId) {
        PasteResponse response = pasteService.getPaste(pasteId, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/get-presigned-fetch-url/{pasteId}")
    public ResponseEntity<Map<String, String>> getPresignedFetchUrl(@PathVariable String pasteId,
                                                                  @RequestAttribute(value = "userId", required = false) String userId) {
        String presignedUrl = pasteService.getPresignedFetchUrl(pasteId, userId);
        return ResponseEntity.ok(Map.of("presignedUrl", presignedUrl));
    }
    
    @DeleteMapping("/delete-paste/{pasteId}")
    public ResponseEntity<Map<String, String>> deletePaste(@PathVariable String pasteId,
                                                         @RequestAttribute("userId") String userId) {
        pasteService.deletePaste(pasteId, userId);
        return ResponseEntity.ok(Map.of("message", "Paste deleted successfully"));
    }
    
    @GetMapping("/get-all-pastes")
    public ResponseEntity<List<PasteResponse>> getAllPastes(@RequestAttribute("userId") String userId) {
        List<PasteResponse> responses = pasteService.getAllUserPastes(userId);
        return ResponseEntity.ok(responses);
    }
}
