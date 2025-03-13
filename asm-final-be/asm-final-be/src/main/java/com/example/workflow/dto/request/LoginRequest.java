package com.example.workflow.dto.request;

public class LoginRequest {
    private String email;
    private String password;

    // Lấy email
    public String getEmail() {
        return email;
    }

    // Đặt email
    public void setEmail(String email) {
        this.email = email;
    }

    // Lấy mật khẩu
    public String getPassword() {
        return password;
    }

    // Đặt mật khẩu
    public void setPassword(String password) {
        this.password = password;
    }
}
