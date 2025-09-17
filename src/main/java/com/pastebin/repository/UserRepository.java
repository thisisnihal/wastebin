package com.pastebin.repository;

import com.pastebin.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    private final RowMapper<User> userRowMapper = new RowMapper<User>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            return User.builder()
                    .id(rs.getString("id"))
                    .email(rs.getString("email"))
                    .name(rs.getString("name"))
                    .googleId(rs.getString("google_id"))
                    .profilePicture(rs.getString("profile_picture"))
                    .refreshToken(rs.getString("refresh_token"))
                    .createdAt(rs.getTimestamp("created_at") != null ? 
                              rs.getTimestamp("created_at").toLocalDateTime() : null)
                    .updatedAt(rs.getTimestamp("updated_at") != null ? 
                              rs.getTimestamp("updated_at").toLocalDateTime() : null)
                    .build();
        }
    };
    
    public User save(User user) {
        if (user.getId() == null) {
            // Insert new user
            String sql = """
                INSERT INTO users (email, name, google_id, profile_picture, refresh_token) 
                VALUES (?, ?, ?, ?, ?)
            """;
            jdbcTemplate.update(sql, user.getEmail(), user.getName(), 
                              user.getGoogleId(), user.getProfilePicture(), user.getRefreshToken());
            
            // Get the generated ID
            String selectSql = "SELECT * FROM users WHERE email = ?";
            return jdbcTemplate.queryForObject(selectSql, userRowMapper, user.getEmail());
        } else {
            // Update existing user
            String sql = """
                UPDATE users SET name = ?, profile_picture = ?, refresh_token = ?, 
                updated_at = CURRENT_TIMESTAMP WHERE id = ?
            """;
            jdbcTemplate.update(sql, user.getName(), user.getProfilePicture(), 
                              user.getRefreshToken(), user.getId());
            return user;
        }
    }
    
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public Optional<User> findByGoogleId(String googleId) {
        String sql = "SELECT * FROM users WHERE google_id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, googleId);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public Optional<User> findByRefreshToken(String refreshToken) {
        String sql = "SELECT * FROM users WHERE refresh_token = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, refreshToken);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public Optional<User> findById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
