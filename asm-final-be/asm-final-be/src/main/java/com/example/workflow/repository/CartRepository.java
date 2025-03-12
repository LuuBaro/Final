package com.example.workflow.repository;

import com.example.workflow.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    List<Cart> findByUserId(UUID userId);
    Optional<Cart> findByUserIdAndProductId(UUID userId, UUID productId);
}
