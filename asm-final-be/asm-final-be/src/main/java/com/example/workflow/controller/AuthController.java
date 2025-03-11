package com.example.workflow.controller;

import com.example.workflow.dto.request.LoginRequest;
import com.example.workflow.model.User;
import com.example.workflow.service.JwtService;
import com.example.workflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService; // Thay JwtUtil bằng JwtService

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Tìm người dùng theo email
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                .findFirst()
                .orElse(null);

        // Kiểm tra thông tin đăng nhập
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Email hoặc mật khẩu không đúng");
        }

        // Tạo UserDetails từ User để tương thích với JwtService
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        // Tạo token bằng JwtService
        String token = jwtService.generateToken(userDetails, user);
        return ResponseEntity.ok(token);
    }
}