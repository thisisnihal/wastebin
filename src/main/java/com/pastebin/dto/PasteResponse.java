package com.pastebin.dto;

import com.pastebin.model.enums.Visibility;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PasteResponse {
    private String id;
    private String title;
    private String text;
    private String language;
    private Visibility visibility;
    private LocalDateTime expiresAt;
    private List<String> authorizedEmails;
    private LocalDateTime createdAt;
    private String ownerEmail;
}
