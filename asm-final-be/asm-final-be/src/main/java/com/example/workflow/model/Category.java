package com.example.workflow.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name; // Ví dụ: "Áo thun", "Quần jeans"

    @Column(length = 500)
    private String description; // Mô tả danh mục (tùy chọn)
}