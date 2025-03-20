package com.example.workflow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-file}")
    private String serviceAccountFile;

    @Value("${firebase.storage-bucket}")
    private String storageBucket;

    @Bean
    public FirebaseApp initializeFirebase() throws IOException {
        // Loại bỏ tiền tố "classpath:" nếu có
        String filePath = serviceAccountFile.startsWith("classpath:")
                ? serviceAccountFile.replace("classpath:", "")
                : serviceAccountFile;
        System.out.println("Loading file: " + filePath); // Debug
        InputStream serviceAccount = new ClassPathResource(filePath).getInputStream();
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket(storageBucket)
                .build();
        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
    }
}
