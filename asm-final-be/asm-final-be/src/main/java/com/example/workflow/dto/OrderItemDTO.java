package com.example.workflow.dto;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class OrderItemDTO {
    private int quantity;
    private String productName;
    private BigDecimal price;
    private BigDecimal subtotal;
}
