package com.example.workflow.controller;

import com.example.workflow.model.Order;
import com.example.workflow.model.User;
import com.example.workflow.repository.OrderRepository;
import com.example.workflow.service.OrderService;
import com.example.workflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    // API lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    // API lấy đơn hàng theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable("userId") String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            List<Order> orders = orderRepository.findAllByUser_Id(userUUID);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid userId format");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        try {
            User currentUser = getCurrentUser();
            Order order = orderService.createOrderFromCart(currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi tạo đơn hàng");
        }
    }

//    @PostMapping("/orders/{orderId}/pay")
//    public ResponseEntity<?> payOrder(@PathVariable UUID orderId) {
//        try {
//            Order updatedOrder = orderService.updateOrderStatus(orderId, Order.OrderStatus.PAID);
//            return ResponseEntity.ok(updatedOrder);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Đã xảy ra lỗi khi thanh toán");
//        }
//    }

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
