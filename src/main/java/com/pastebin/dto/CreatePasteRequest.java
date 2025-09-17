package com.pastebin.dto;

import com.pastebin.model.enums.Visibility;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePasteRequest {
    private String title;
    private String text;
    private String language = "text";
    private Visibility visibility;
    private LocalDateTime expiresAt;
    private List<String> authorizedEmails;
}
