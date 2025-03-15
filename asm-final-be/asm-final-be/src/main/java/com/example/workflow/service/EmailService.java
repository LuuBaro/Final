package com.example.workflow.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

//    @Autowired
//    private  JavaMailSender mailSender;
//
//
//
//    public void sendResetPasswordEmail(String to, String resetLink) throws MessagingException {
//        MimeMessage message = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//        helper.setTo(to);
//        helper.setSubject("Khôi phục mật khẩu - Shop Quần Áo");
//        helper.setText(
//                "<h2>Yêu cầu khôi phục mật khẩu</h2>" +
//                        "<p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>" +
//                        "<p><a href='" + resetLink + "'>Đặt lại mật khẩu</a></p>" +
//                        "<p>Liên kết này sẽ hết hạn sau 1 giờ.</p>", true);
//
//        mailSender.send(message);
//    }
}
