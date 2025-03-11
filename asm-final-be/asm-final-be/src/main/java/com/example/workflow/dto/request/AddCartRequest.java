package com.example.workflow.dto.request;

import java.util.UUID;

public class AddCartRequest {
    private UUID productId; // ID của sản phẩm
    private Integer quantity; // Số lượng sản phẩm

    // Lấy ID sản phẩm
    public UUID getProductId() {
        return productId;
    }

    // Đặt ID sản phẩm
    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    // Lấy số lượng
    public Integer getQuantity() {
        return quantity;
    }

    // Đặt số lượng
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
