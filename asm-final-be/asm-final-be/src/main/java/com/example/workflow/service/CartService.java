package com.example.workflow.service;

import com.example.workflow.model.Cart;
import com.example.workflow.model.Product;
import com.example.workflow.model.User;
import com.example.workflow.repository.CartRepository;
import com.example.workflow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Cart addToCart(User user, UUID productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setProduct(product);
        cart.setQuantity(quantity);

        return cartRepository.save(cart);
    }

    public List<Cart> getCartItems(UUID userId) {
        return cartRepository.findByUserId(userId);
    }

    @Transactional
    public void removeFromCart(UUID cartId) {
        cartRepository.deleteById(cartId);
    }
}
