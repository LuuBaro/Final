package com.example.workflow.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;

    public enum OrderStatus {
        PENDING,       // Chờ xử lý
        CONFIRMED,     // Đã xác nhận
        CANCELED,      // Đã hủy
        DELETED,       // Đã xóa
        PAID,          // Đã thanh toán
        FAILED         // Thanh toán thất bại
    }
}