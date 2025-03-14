package com.example.workflow.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderReportDTO {
    private UUID id;
    private String userName;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal totalAmount;
    private String products;
    private List<OrderItemDTO> items;
}
