package com.pastebin.model;

import com.pastebin.model.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paste {
    private String id;
    private String userId;
    private String title;
    private String language;
    private String s3Key;
    private Visibility visibility;
    private LocalDateTime expiresAt;
    private List<String> authorizedEmails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
