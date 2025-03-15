package com.example.workflow.service;

import com.example.workflow.model.Cart;
import com.example.workflow.model.Product;
import com.example.workflow.model.User;
import com.example.workflow.repository.CartRepository;
import com.example.workflow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserService userService;

    // Lấy thông tin người dùng hiện tại từ Spring Security
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userIdStr = ((UserDetails) principal).getUsername();
            UUID userId = UUID.fromString(userIdStr);
            return userService.getUserById(userId);
        } else {
            throw new RuntimeException("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    @Transactional
    public Cart addToCart(UUID productId, Integer quantity) {
        User user = getCurrentUser();

        // Kiểm tra dữ liệu đầu vào
        if (productId == null || quantity == null) {
            throw new IllegalArgumentException("ID sản phẩm và số lượng là bắt buộc");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Kiểm tra sản phẩm
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng của user chưa
        Optional<Cart> existingCart = cartRepository.findByUserIdAndProductId(user.getId(), productId);

        if (existingCart.isPresent()) {
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            Cart cart = existingCart.get();
            int newQuantity = cart.getQuantity() + quantity;
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Insufficient stock");
            }
            cart.setQuantity(newQuantity);
            return cartRepository.save(cart);
        } else {
            // Nếu sản phẩm chưa tồn tại, tạo mới
            if (product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(quantity);
            return cartRepository.save(cart);
        }
    }

    // Lấy danh sách sản phẩm trong giỏ hàng
    public List<Cart> getCartItems() {
        User user = getCurrentUser();
        return cartRepository.findByUserId(user.getId());
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    @Transactional
    public Cart updateCartQuantity(UUID cartId, Integer quantity) {
        User user = getCurrentUser();

        // Kiểm tra dữ liệu đầu vào
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Kiểm tra Cart
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Kiểm tra quyền sở hữu
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        // Kiểm tra stock
        Product product = cart.getProduct();
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        // Cập nhật số lượng
        cart.setQuantity(quantity);
        return cartRepository.save(cart);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    @Transactional
    public void removeFromCart(UUID cartId) {
        User user = getCurrentUser();

        // Kiểm tra Cart
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Kiểm tra quyền sở hữu
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        // Xóa Cart
        cartRepository.deleteById(cartId);
    }
}