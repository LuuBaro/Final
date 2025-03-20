package com.example.workflow.config;

import com.example.workflow.service.JwtService;
import com.example.workflow.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private UserService userService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    //Kiểm tra token JWT từ header, xác thực và đặt thông tin vào SecurityContext.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Lấy header Authorization từ yêu cầu
        final String authorizationHeader = request.getHeader("Authorization");

        String userId = null;
        String jwt = null;

        // Kiểm tra và trích xuất JWT từ header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Loại bỏ "Bearer " prefix
            try {
                userId = jwtService.extractUsername(jwt); // Trích xuất userId từ token
            } catch (Exception e) {
                System.err.println("Lỗi khi trích xuất userId từ token: " + e.getMessage());
            }
        } else {
            System.out.println("No Bearer token found in Authorization header");
        }

        // Xác thực nếu userId tồn tại và chưa có xác thực trong SecurityContext
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;

            // Tải thông tin người dùng từ userId
            try {
                userDetails = this.userService.loadUserById(userId);
            } catch (UsernameNotFoundException e) {
                System.err.println("Không tìm thấy user với userId: " + userId);
            } catch (Exception e) {
                System.err.println("Lỗi khi tải UserDetails: " + e.getMessage());
            }

            // Trích xuất role từ token
            String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));

            // Kiểm tra và đặt xác thực nếu token hợp lệ
            if (userDetails != null && jwtService.validateToken(jwt, userDetails) && role != null) {

                // Tạo danh sách authorities từ role
                List<GrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(role)
                );

                // Tạo đối tượng xác thực và đặt vào SecurityContext
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.err.println("Xác thực thất bại cho userId: " + userId);
                if (userDetails == null) {
                    System.err.println("UserDetails là null cho userId: " + userId);
                }
                if (userDetails != null && !jwtService.validateToken(jwt, userDetails)) {
                    System.err.println("Token không hợp lệ cho userId: " + userId);
                }
                if (role == null) {
                    System.err.println("Role không tồn tại trong token cho userId: " + userId);
                }
            }
        } else {
            System.out.println("No userId extracted or authentication already exists");
        }

        // Tiếp tục chuỗi bộ lọc
        chain.doFilter(request, response);
    }
}