package com.pastebin.service;

import com.pastebin.dto.CreatePasteRequest;
import com.pastebin.dto.PasteResponse;
import com.pastebin.model.Paste;
import com.pastebin.model.User;
import com.pastebin.model.enums.Visibility;
import com.pastebin.repository.PasteRepository;
import com.pastebin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasteService {
    
    private final PasteRepository pasteRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    
    public PasteResponse createPaste(CreatePasteRequest request, String userId) {
        // Upload text to S3
        String s3Key = s3Service.uploadText(request.getText());
        
        // Create paste entity
        Paste paste = Paste.builder()
                .userId(userId)
                .title(request.getTitle())
                .language(request.getLanguage())
                .s3Key(s3Key)
                .visibility(request.getVisibility())
                .expiresAt(request.getExpiresAt())
                .authorizedEmails(request.getAuthorizedEmails())
                .build();
        
        paste = pasteRepository.save(paste);
        
        return convertToResponse(paste, request.getText());
    }
    
    public Map<String, String> getPresignedUploadUrl(CreatePasteRequest request, String userId) {
        String urlAndKey = s3Service.getPresignedUploadUrl();
        String[] parts = urlAndKey.split("\\|");
        String presignedUrl = parts[0];
        String s3Key = parts[1];
        
        // Create paste entity without text
        Paste paste = Paste.builder()
                .userId(userId)
                .title(request.getTitle())
                .language(request.getLanguage())
                .s3Key(s3Key)
                .visibility(request.getVisibility())
                .expiresAt(request.getExpiresAt())
                .authorizedEmails(request.getAuthorizedEmails())
                .build();
        
        paste = pasteRepository.save(paste);
        
        return Map.of(
            "presignedUrl", presignedUrl,
            "pasteId", paste.getId()
        );
    }
    
    public PasteResponse getPaste(String pasteId, String currentUserId) {
        Optional<Paste> pasteOpt = pasteRepository.findById(pasteId);
        if (pasteOpt.isEmpty()) {
            throw new RuntimeException("Paste not found");
        }
        
        Paste paste = pasteOpt.get();
        
        // Check if paste is expired
        if (paste.getExpiresAt() != null && paste.getExpiresAt().isBefore(LocalDateTime.now())) {
            s3Service.deleteObject(paste.getS3Key());
            pasteRepository.deleteById(pasteId);
            throw new RuntimeException("Paste has expired");
        }
        
        // Check access permissions
        if (!canAccessPaste(paste, currentUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Get text content from S3
        String textContent = s3Service.getTextContent(paste.getS3Key());
        
        return convertToResponse(paste, textContent);
    }
    
    public String getPresignedFetchUrl(String pasteId, String currentUserId) {
        Optional<Paste> pasteOpt = pasteRepository.findById(pasteId);
        if (pasteOpt.isEmpty()) {
            throw new RuntimeException("Paste not found");
        }
        
        Paste paste = pasteOpt.get();
        
        // Check access permissions
        if (!canAccessPaste(paste, currentUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        return s3Service.getPresignedFetchUrl(paste.getS3Key());
    }
    
    public void deletePaste(String pasteId, String currentUserId) {
        Optional<Paste> pasteOpt = pasteRepository.findById(pasteId);
        if (pasteOpt.isEmpty()) {
            throw new RuntimeException("Paste not found");
        }
        
        Paste paste = pasteOpt.get();
        
        // Only owner can delete
        if (!paste.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Access denied");
        }
        
        // Delete from S3 and database
        s3Service.deleteObject(paste.getS3Key());
        pasteRepository.deleteById(pasteId);
    }
    
    public List<PasteResponse> getAllUserPastes(String userId) {
        List<Paste> pastes = pasteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return pastes.stream()
                .map(paste -> convertToResponse(paste, null)) // Don't fetch text content for list
                .toList();
    }
    
    private boolean canAccessPaste(Paste paste, String currentUserId) {
        return switch (paste.getVisibility()) {
            case PUBLIC -> true;
            case PRIVATE -> paste.getUserId().equals(currentUserId);
            case CUSTOM -> {
                if (paste.getUserId().equals(currentUserId)) {
                    yield true;
                }
                if (currentUserId != null && paste.getAuthorizedEmails() != null) {
                    Optional<User> userOpt = userRepository.findById(currentUserId);
                    if (userOpt.isPresent()) {
                        yield paste.getAuthorizedEmails().contains(userOpt.get().getEmail());
                    }
                }
                yield false;
            }
        };
    }
    
    private PasteResponse convertToResponse(Paste paste, String textContent) {
        String ownerEmail = null;
        if (paste.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(paste.getUserId());
            ownerEmail = userOpt.map(User::getEmail).orElse(null);
        }
        
        return PasteResponse.builder()
                .id(paste.getId())
                .title(paste.getTitle())
                .text(textContent)
                .language(paste.getLanguage())
                .visibility(paste.getVisibility())
                .expiresAt(paste.getExpiresAt())
                .authorizedEmails(paste.getAuthorizedEmails())
                .createdAt(paste.getCreatedAt())
                .ownerEmail(ownerEmail)
                .build();
    }
}
