package com.example.workflow.service;
import com.example.workflow.model.User;
import com.example.workflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService { // Implements UserDetailsService

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // Đăng ký người dùng mới với role mặc định là USER
    @Transactional
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên không được để trống");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(User.Role.USER);
        return userRepository.save(user);
    }

    // Cập nhật thông tin người dùng
    @Transactional
    public User updateUser(UUID userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        // Logic cập nhật giữ nguyên
        if (userDetails.getName() != null && !userDetails.getName().trim().isEmpty()) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getEmail() != null && !userDetails.getEmail().trim().isEmpty()) {
            if (!userDetails.getEmail().equals(user.getEmail()) &&
                    userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        return userRepository.save(user);
    }

    // Xóa người dùng
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        userRepository.delete(user);
    }

    // Lấy tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Quên mật khẩu
//    @Transactional
//    public void forgotPassword(String email) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));
//
//        // Tạo token dựa trên email, thời gian, và một salt ngẫu nhiên
//        String rawToken = email + "|" + LocalDateTime.now().toString() + "|" + UUID.randomUUID().toString();
//        String token = passwordEncoder.encode(rawToken); // Mã hóa token để tăng độ an toàn
//
//        // Tạo liên kết khôi phục
//        String resetLink = "http://localhost:5173/reset-password?token=" + token + "&email=" + email;
//
//        // Gửi email
//        try {
//            emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
//        } catch (Exception e) {
//            throw new RuntimeException("Lỗi khi gửi email khôi phục: " + e.getMessage());
//        }
//    }

    // Lấy thông tin người dùng theo ID
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    public UserDetails loadUserById(String userIdStr) throws UsernameNotFoundException {
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getId().toString())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        // Tạo token: email + thời gian tạo + một giá trị ngẫu nhiên
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        String rawToken = email + "|" + timestamp + "|" + UUID.randomUUID().toString();

        // Mã hóa token bằng Base64 để dễ dàng giải mã
        String token = Base64.getEncoder().encodeToString(rawToken.getBytes());

        // Tạo liên kết khôi phục
        String resetLink = "http://localhost:5173/reset-password?token=" + token + "&email=" + email;

        // Log để kiểm tra
        System.out.println("Generated Reset Link: " + resetLink);

        // Gửi email
        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email khôi phục: " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String token, String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        // Giải mã token từ Base64
        String decodedToken;
        try {
            decodedToken = new String(Base64.getDecoder().decode(token));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Token không hợp lệ");
        }

        // Tách các phần của token
        String[] tokenParts = decodedToken.split("\\|");
        if (tokenParts.length != 3) {
            throw new RuntimeException("Token không hợp lệ");
        }

        String tokenEmail = tokenParts[0];
        String timestamp = tokenParts[1];

        // Kiểm tra email trong token có khớp không
        if (!tokenEmail.equals(email)) {
            throw new RuntimeException("Token không hợp lệ");
        }

        // Kiểm tra thời gian hết hạn
        LocalDateTime tokenTime;
        try {
            tokenTime = LocalDateTime.parse(timestamp, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            throw new RuntimeException("Token không hợp lệ");
        }

        LocalDateTime expiryTime = tokenTime.plusHours(1); // Token hết hạn sau 1 giờ
        if (LocalDateTime.now().isAfter(expiryTime)) {
            throw new RuntimeException("Token đã hết hạn");
        }

        // Đặt lại mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}