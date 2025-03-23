package com.example.workflow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderReportDTO {
    private UUID id;
    private String userName;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal totalAmount;
    private String products;
    private List<OrderItemDTO> items;

    // Constructor mặc định
    public OrderReportDTO() {
    }

    // Constructor mới nhận thông báo lỗi
    public OrderReportDTO(String errorMessage) {
        this.userName = errorMessage; // Gán thông báo lỗi vào userName
    }

    // Getters và Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getProducts() { return products; }
    public void setProducts(String products) { this.products = products; }
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
}