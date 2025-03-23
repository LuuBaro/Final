package com.example.workflow.controller;

import com.example.workflow.model.Product;
import com.example.workflow.service.FirebaseStorageService;
import com.example.workflow.service.ProductService;
import net.sf.jasperreports.engine.JRException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FirebaseStorageService firebaseStorageService;

    // Thêm sản phẩm mới (chỉ ADMIN)
    @PostMapping(value = "/products", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("categoryId") UUID categoryId,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Kiểm tra các trường bắt buộc
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên sản phẩm không được để trống");
            }
            if (categoryId == null) {
                return ResponseEntity.badRequest().body("Danh mục sản phẩm không được để trống");
            }
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Giá sản phẩm phải lớn hơn 0");
            }
            if (stock == null || stock < 0) {
                return ResponseEntity.badRequest().body("Số lượng tồn kho không được âm");
            }

            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setStock(stock);

            // Upload ảnh nếu có
            if (image != null && !image.isEmpty()) {
                String imageUrl = firebaseStorageService.uploadFile(image, "product-images");
                product.setImageUrl(imageUrl);
            }

            Product createdProduct = productService.createProduct(product, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload ảnh sản phẩm: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi thêm sản phẩm");
        }
    }

    // Cập nhật sản phẩm (chỉ ADMIN)
    @PutMapping(value = "/products/{productId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateProduct(
            @PathVariable("productId") UUID productId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "stock", required = false) Integer stock,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Upload ảnh mới nếu có
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                imageUrl = firebaseStorageService.uploadFile(image, "product-images");
            }

            Product updatedProduct = productService.updateProduct(productId, name, categoryId, price, stock, imageUrl);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload ảnh sản phẩm: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi cập nhật sản phẩm");
        }
    }

    // Xóa sản phẩm (chỉ ADMIN)
    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable("productId") UUID productId) {
        try {
            productService.deleteProduct(productId);
            return ResponseEntity.ok("Đã xóa sản phẩm thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi xóa sản phẩm");
        }
    }

    // Lấy tất cả sản phẩm (USER và ADMIN đều xem được)
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Lấy thông tin một sản phẩm theo ID (USER và ADMIN đều xem được)
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable UUID productId) {
        try {
            Product product = productService.getProductById(productId);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy thông tin sản phẩm");
        }
    }

    // API import sản phẩm từ file Excel với JasperReports (chỉ ADMIN)
    @PostMapping("/products/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> importProductsFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            // Kiểm tra file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File không được để trống");
            }
            if (!file.getOriginalFilename().endsWith(".xlsx")) {
                return ResponseEntity.badRequest().body("Vui lòng upload file Excel (.xlsx)");
            }

            // Gọi service để xử lý file với JasperReports
            List<Product> importedProducts = productService.importProductsFromExcel(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(importedProducts);
        } catch (IOException | JRException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi import sản phẩm: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}