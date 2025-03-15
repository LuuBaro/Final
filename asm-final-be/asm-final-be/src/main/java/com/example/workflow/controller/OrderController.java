package com.example.workflow.controller;

import com.example.workflow.dto.OrderReportDTO;
import com.example.workflow.model.Order;
import com.example.workflow.model.User;
import com.example.workflow.repository.OrderRepository;
import com.example.workflow.service.OrderService;
import com.example.workflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    private final OrderService orderService;
    private final UserService userService;

    // API lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal Server Error: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        try {
            User currentUser = getCurrentUser();
            Order order = orderService.createOrderFromCart(currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi tạo đơn hàng");
        }
    }

    // Lấy thông tin người dùng hiện tại từ Spring Security
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userIdStr = ((UserDetails) principal).getUsername(); // Username là userId
            UUID userId = UUID.fromString(userIdStr);
            return userService.getUserById(userId);
        }
        throw new RuntimeException("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<OrderReportDTO>> getOrderReport(
            @RequestParam(name = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(name = "status", required = false) String status) {
        try {
            List<OrderReportDTO> orders = orderService.getOrderReport(fromDate, toDate, status);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            OrderReportDTO errorDto = new OrderReportDTO();
            errorDto.setUserName(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(errorDto));
        }
    }

    @GetMapping("/export/{format}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> exportReport(
            @PathVariable("format") String format,
            @RequestParam(name = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(name = "status", required = false) String status) {
        try {
            byte[] reportData = orderService.exportReport(format, fromDate, toDate, status);
            String fileName = "report_" + LocalDate.now().toString() + (format.equalsIgnoreCase("pdf") ? ".pdf" : ".xlsx");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentType(format.equalsIgnoreCase("pdf") ? MediaType.APPLICATION_PDF :
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(reportData.length)
                    .body(new ByteArrayResource(reportData));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"Error generating report: " + e.getMessage() + "\"}");
        }
    }
}