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
import java.util.UUID;

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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        System.out.println("Request URL: " + request.getRequestURI());
        System.out.println("Authorization Header: " + authorizationHeader);

        String userId = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                userId = jwtService.extractUsername(jwt);
                System.out.println("Extracted userId from token: " + userId);
            } catch (Exception e) {
                System.err.println("Lỗi khi trích xuất userId từ token: " + e.getMessage());
            }
        } else {
            System.out.println("No Bearer token found in Authorization header");
        }

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.userService.loadUserById(userId);
                System.out.println("Loaded UserDetails: " + (userDetails != null ? userDetails.getUsername() : "null"));
                System.out.println("UserDetails authorities: " + (userDetails != null ? userDetails.getAuthorities() : "null"));
            } catch (UsernameNotFoundException e) {
                System.err.println("Không tìm thấy user với userId: " + userId);
            } catch (Exception e) {
                System.err.println("Lỗi khi tải UserDetails: " + e.getMessage());
            }

            String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
            System.out.println("Role extracted from token: " + role);

            if (userDetails != null && jwtService.validateToken(jwt, userDetails) && role != null) {
                List<GrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(role)
                );
                System.out.println("Authorities set for userId " + userId + ": " + authorities);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Authentication set successfully for userId: " + userId);
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
        chain.doFilter(request, response);
    }
}