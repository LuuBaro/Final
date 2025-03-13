package com.example.workflow.controller;

import com.example.workflow.repository.OrderRepository;
import com.example.workflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class CamundaController {
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // API hủy đơn hàng của khách hàng
    @PutMapping("/cancel-order")
    public ResponseEntity<?> cancelOrder(
            @RequestParam("orderId") String orderId,
            @RequestParam(value = "taskId", required = false) String taskId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, taskId));
    }

    // API xóa đơn hàng của khách hàng
    @PutMapping("/delete-order")
    public ResponseEntity<?> deleteOrder(
            @RequestParam("orderId") String orderId,
            @RequestParam(value = "taskId", required = false) String taskId
    ) {
        return ResponseEntity.ok(orderService.deleteOrder(orderId, taskId));
    }

    // API xác nhận đơn hàng của admin
    @PutMapping("/approve-order")
    public ResponseEntity<?> approveOrder(
            @RequestParam("orderId") String orderId,
            @RequestParam(value = "taskId", required = false) String taskId
    ) {
        return ResponseEntity.ok(orderService.approveOrder(orderId, taskId));
    }

    // API xác nhận từ chối đơn hàng của admin
    @PutMapping("/reject-stock")
    public ResponseEntity<?> rejectStock(@RequestParam("orderId") String orderId) {
        return orderService.rejectStock(orderId);
    }

    // API xác nhận đồng ý đơn hàng của admin
    @PutMapping("/approve-stock")
    public ResponseEntity<String> approveStock(@RequestParam("orderId") String orderId) {
        return orderService.approveStock(orderId);
    }
}
