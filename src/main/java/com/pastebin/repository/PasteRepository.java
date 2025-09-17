package com.pastebin.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pastebin.model.Paste;
import com.pastebin.model.enums.Visibility;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PasteRepository {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final RowMapper<Paste> pasteRowMapper = new RowMapper<Paste>() {
        @Override
        public Paste mapRow(ResultSet rs, int rowNum) throws SQLException {
            List<String> authorizedEmails = null;
            String emailsJson = rs.getString("authorized_emails");
            
            if (emailsJson != null) {
                try {
                    authorizedEmails = objectMapper.readValue(emailsJson, new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    // Log error and continue
                }
            }
            
            return Paste.builder()
                    .id(rs.getString("id"))
                    .userId(rs.getString("user_id"))
                    .title(rs.getString("title"))
                    .language(rs.getString("language"))
                    .s3Key(rs.getString("s3_key"))
                    .visibility(Visibility.valueOf(rs.getString("visibility")))
                    .expiresAt(rs.getTimestamp("expires_at") != null ? 
                              rs.getTimestamp("expires_at").toLocalDateTime() : null)
                    .authorizedEmails(authorizedEmails)
                    .createdAt(rs.getTimestamp("created_at") != null ? 
                              rs.getTimestamp("created_at").toLocalDateTime() : null)
                    .updatedAt(rs.getTimestamp("updated_at") != null ? 
                              rs.getTimestamp("updated_at").toLocalDateTime() : null)
                    .build();
        }
    };
    
    public Paste save(Paste paste) {
        String emailsJson = null;
        if (paste.getAuthorizedEmails() != null) {
            try {
                emailsJson = objectMapper.writeValueAsString(paste.getAuthorizedEmails());
            } catch (Exception e) {
                // Log error
            }
        }
        
        String sql = """
            INSERT INTO pastes (user_id, title, language, s3_key, visibility, 
            expires_at, authorized_emails) VALUES (?, ?, ?, ?, ?, ?, ?)
        """;
        
        jdbcTemplate.update(sql, paste.getUserId(), paste.getTitle(), paste.getLanguage(),
                          paste.getS3Key(), paste.getVisibility().name(), paste.getExpiresAt(),
                          emailsJson);
        
        // Get the generated paste
        String selectSql = "SELECT * FROM pastes WHERE s3_key = ? ORDER BY created_at DESC LIMIT 1";
        return jdbcTemplate.queryForObject(selectSql, pasteRowMapper, paste.getS3Key());
    }
    
    public Optional<Paste> findById(String id) {
        String sql = "SELECT * FROM pastes WHERE id = ?";
        try {
            Paste paste = jdbcTemplate.queryForObject(sql, pasteRowMapper, id);
            return Optional.ofNullable(paste);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public List<Paste> findByUserIdOrderByCreatedAtDesc(String userId) {
        String sql = "SELECT * FROM pastes WHERE user_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, pasteRowMapper, userId);
    }
    
    public void deleteById(String id) {
        String sql = "DELETE FROM pastes WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
    
    public long countByUserId(String userId) {
        String sql = "SELECT COUNT(*) FROM pastes WHERE user_id = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, userId);
    }
    
    public long countByUserIdAndVisibility(String userId, Visibility visibility) {
        String sql = "SELECT COUNT(*) FROM pastes WHERE user_id = ? AND visibility = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, userId, visibility.name());
    }
    
    public void deleteExpiredPastes() {
        String sql = "DELETE FROM pastes WHERE expires_at < NOW()";
        jdbcTemplate.update(sql);
    }
}
