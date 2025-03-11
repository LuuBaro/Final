package com.example.workflow.controller;

import com.example.workflow.dto.request.AddCartRequest;
import com.example.workflow.model.Cart;
import com.example.workflow.model.User;
import com.example.workflow.service.CartService;
import com.example.workflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService; // Thêm UserService để lấy thông tin User từ database

    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/addCart")
    public ResponseEntity<?> addToCart(@RequestBody AddCartRequest request) {
        try {
            // Lấy thông tin người dùng hiện tại từ Spring Security
            User currentUser = getCurrentUser();

            // Kiểm tra dữ liệu đầu vào
            if (request.getProductId() == null || request.getQuantity() == null) {
                return ResponseEntity.badRequest()
                        .body("ID sản phẩm và số lượng là bắt buộc");
            }

            // Kiểm tra số lượng phải lớn hơn 0
            if (request.getQuantity() <= 0) {
                return ResponseEntity.badRequest()
                        .body("Số lượng phải lớn hơn 0");
            }

            // Thêm sản phẩm vào giỏ hàng bằng cách gọi service
            Cart cart = cartService.addToCart(
                    currentUser,
                    request.getProductId(),
                    request.getQuantity()
            );

            // Trả về phản hồi thành công với mã trạng thái 201 (Created)
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(cart);

        } catch (RuntimeException e) {
            // Xử lý lỗi runtime (ví dụ: không đủ hàng, sản phẩm không tồn tại)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            // Xử lý lỗi bất ngờ khác
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi thêm vào giỏ hàng");
        }
    }

    // Lấy thông tin người dùng hiện tại từ Spring Security
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userIdStr = ((UserDetails) principal).getUsername(); // Username là userId
            UUID userId = UUID.fromString(userIdStr);
            return userService.getUserById(userId);
        } else {
            throw new RuntimeException("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
        }
    }
}