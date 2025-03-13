package com.example.workflow.controller;

import com.example.workflow.dto.request.AddCartRequest;
import com.example.workflow.model.Cart;
import com.example.workflow.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartService cartService;

    // Lấy danh sách sản phẩm trong giỏ hàng
    @GetMapping("/cart")
    public ResponseEntity<?> getCartItems() {
        try {
            List<Cart> cartItems = cartService.getCartItems();
            return ResponseEntity.ok(cartItems);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy giỏ hàng");
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/addCart")
    public ResponseEntity<?> addToCart(@RequestBody AddCartRequest request) {
        try {
            Cart cart = cartService.addToCart(request.getProductId(), request.getQuantity());
            return ResponseEntity.status(HttpStatus.CREATED).body(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi thêm vào giỏ hàng");
        }
    }

    // Cập nhật số lượng của một sản phẩm trong giỏ hàng
    @PutMapping("/cart/{cartId}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable("cartId") UUID cartId, @RequestBody Map<String, Integer> request) {
        try {
            Cart updatedCart = cartService.updateCartQuantity(cartId, request.get("quantity"));
            return ResponseEntity.ok(updatedCart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi cập nhật giỏ hàng");
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    @DeleteMapping("/cart/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable("cartId") UUID cartId) {
        try {
            cartService.removeFromCart(cartId);
            return ResponseEntity.ok("Sản phẩm đã được xóa khỏi giỏ hàng");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng");
        }
    }
}