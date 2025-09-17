package com.pastebin.service;

import com.pastebin.config.S3Config;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Config s3Config;
    
    public String uploadText(String text) {
        String key = "pastes/" + UUID.randomUUID().toString() + ".txt";
        
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .contentType("text/plain")
                .build();
        
        s3Client.putObject(request, RequestBody.fromString(text));
        return key;
    }
    
    public String getPresignedUploadUrl() {
        String key = "pastes/" + UUID.randomUUID().toString() + ".txt";
        
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .contentType("text/plain")
                .build();
        
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();
        
        String url = s3Presigner.presignPutObject(presignRequest).url().toString();
        return url + "|" + key; // Return both URL and key
    }
    
    public String getPresignedFetchUrl(String key) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .build();
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(objectRequest)
                .build();
        
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
    
    public String getTextContent(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .build();
        
        return s3Client.getObjectAsBytes(request).asUtf8String();
    }
    
    public void deleteObject(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(s3Config.getBucketName())
                .key(key)
                .build();
        
        s3Client.deleteObject(request);
    }
}
