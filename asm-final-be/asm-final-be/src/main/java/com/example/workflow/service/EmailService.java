package com.example.workflow.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendResetPasswordEmail(String to, String resetLink) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Khôi phục mật khẩu - Baro Fashion");

        // HTML tùy chỉnh với giao diện siêu xịn
        helper.setText(
                "<!DOCTYPE html>" +
                        "<html lang='vi'>" +
                        "<head>" +
                        "    <meta charset='UTF-8'>" +
                        "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                        "    <title>Khôi phục mật khẩu - Baro Fashion</title>" +
                        "</head>" +
                        "<body style='margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f0f4f8; color: #2d3748; line-height: 1.6;'>" +
                        "    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 650px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);'>" +
                        "        <tr>" +
                        "            <td style='padding: 0;'>" +
                        "                <!-- Header -->" +
                        "                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background: linear-gradient(135deg, #3b82f6, #14b8a6, #10b981); border-top-left-radius: 15px; border-top-right-radius: 15px; position: relative; overflow: hidden;'>" +
                        "                    <tr>" +
                        "                        <td style='padding: 40px 30px; text-align: center; position: relative;'>" +
                        "                            <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://via.placeholder.com/650x200/3b82f6/ffffff?text=Baro+Fashion+Banner') no-repeat center; background-size: cover; opacity: 0.1; z-index: 1;'></div>" +
                        "                            <h1 style='color: #ffffff; font-size: 32px; margin: 0; font-weight: 700; text-transform: uppercase; position: relative; z-index: 2; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);'>Baro Fashion</h1>" +
                        "                            <p style='color: #ffffff; font-size: 18px; margin: 15px 0 0; font-style: italic; position: relative; z-index: 2; opacity: 0.9;'>Kết nối phong cách, định hình tương lai</p>" +
                        "                            <div style='height: 5px; background: linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)); margin-top: 20px;'></div>" +
                        "                        </td>" +
                        "                    </tr>" +
                        "                </table>" +
                        "                <!-- Body -->" +
                        "                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #ffffff;'>" +
                        "                    <tr>" +
                        "                        <td style='padding: 50px 40px; text-align: center; border-bottom: 1px solid #e2e8f0;'>" +
                        "                            <h2 style='color: #2d3748; font-size: 28px; margin: 0 0 25px; font-weight: 600; letter-spacing: 0.5px;'>Yêu cầu khôi phục mật khẩu</h2>" +
                        "                            <p style='color: #4a5568; font-size: 16px; margin: 0 0 35px; max-width: 450px; margin-left: auto; margin-right: auto;'>Chào bạn! Chúng tôi đã ghi nhận yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Nhấn vào nút sang trọng bên dưới để thiết lập lại mật khẩu. Liên kết này sẽ hết hạn sau 1 giờ.</p>" +
                        "                            <a href='" + resetLink + "' style='display: inline-block; padding: 14px 30px; background: linear-gradient(45deg, #3b82f6, #14b8a6); color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; overflow: hidden;'>" +
                        "                                <span style='position: relative; z-index: 1;'>Đặt lại mật khẩu ngay</span>" +
                        "                                <span style='position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)); transition: left 0.4s ease;'></span>" +
                        "                            </a>" +
                        "                            <p style='color: #718096; font-size: 14px; margin: 40px 0 0; max-width: 400px; margin-left: auto; margin-right: auto;'>Nếu bạn không yêu cầu khôi phục, vui lòng bỏ qua email này hoặc liên hệ <a href='mailto:support@barofashion.com' style='color: #3b82f6; font-weight: 500; text-decoration: none;'>hỗ trợ ngay</a>.</p>" +
                        "                        </td>" +
                        "                    </tr>" +
                        "                </table>" +
                        "                <!-- Footer -->" +
                        "                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background: linear-gradient(to right, #f7fafc, #edf2f7); border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;'>" +
                        "                    <tr>" +
                        "                        <td style='padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;'>" +
                        "                            <p style='color: #4a5568; font-size: 14px; margin: 0; font-style: italic;'>© 2025 Baro Fashion. Tất cả quyền được bảo lưu với sự tinh tế.</p>" +
                        "                            <p style='color: #4a5568; font-size: 14px; margin: 10px 0 0;'>Kết nối: <a href='mailto:support@barofashion.com' style='color: #3b82f6; font-weight: 500; text-decoration: none;'>support@barofashion.com</a> | " +
                        "                            <a href='https://barofashion.com' style='color: #3b82f6; font-weight: 500; text-decoration: none;'>Thăm website</a></p>" +
                        "                            <div style='margin-top: 15px;'>" +
                        "                                <a href='https://facebook.com' style='margin: 0 10px;'><img src='https://via.placeholder.com/24/1877F2/ffffff?text=F' alt='Facebook' style='vertical-align: middle;'></a>" +
                        "                                <a href='https://instagram.com' style='margin: 0 10px;'><img src='https://via.placeholder.com/24/E1306C/ffffff?text=I' alt='Instagram' style='vertical-align: middle;'></a>" +
                        "                                <a href='https://twitter.com' style='margin: 0 10px;'><img src='https://via.placeholder.com/24/1DA1F2/ffffff?text=T' alt='Twitter' style='vertical-align: middle;'></a>" +
                        "                            </div>" +
                        "                        </td>" +
                        "                    </tr>" +
                        "                </table>" +
                        "            </td>" +
                        "        </tr>" +
                        "    </table>" +
                        "</body>" +
                        "</html>", true);

        mailSender.send(message);
    }
}