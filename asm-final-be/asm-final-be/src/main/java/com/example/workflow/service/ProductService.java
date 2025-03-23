package com.example.workflow.service;

import com.example.workflow.model.Category;
import com.example.workflow.model.Product;
import com.example.workflow.repository.CategoryRepository;
import com.example.workflow.repository.ProductRepository;
import com.google.cloud.storage.Storage;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import jakarta.persistence.EntityManager;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRXlsxDataSource;
import net.sf.jasperreports.engine.design.JRDesignField;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FirebaseApp firebaseApp;

    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Product createProduct(Product product, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại với ID: " + categoryId));
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID productId, String name, UUID categoryId, BigDecimal price, Integer stock, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        if (name != null && !name.trim().isEmpty()) {
            product.setName(name);
        }
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại với ID: " + categoryId));
            product.setCategory(category);
        }
        if (price != null && price.compareTo(BigDecimal.ZERO) > 0) {
            product.setPrice(price);
        }
        if (stock != null && stock >= 0) {
            product.setStock(stock);
        }
        if (imageUrl != null) {
            product.setImageUrl(imageUrl);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // Xóa ảnh trên Firebase Storage nếu có
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            Storage storage = StorageClient.getInstance(firebaseApp).bucket().getStorage();
            String filePath = extractFilePathFromUrl(product.getImageUrl());
            storage.delete(firebaseApp.getOptions().getStorageBucket(), filePath);
        }

        productRepository.delete(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    // Hàm hỗ trợ trích xuất file path từ URL Firebase Storage
    private String extractFilePathFromUrl(String imageUrl) {
        String bucketPrefix = "https://storage.googleapis.com/" + firebaseApp.getOptions().getStorageBucket() + "/";
        return imageUrl.replace(bucketPrefix, "");
    }

    @Transactional
    public List<Product> importProductsFromExcel(MultipartFile file) throws IOException, JRException {
        List<Product> products = new ArrayList<>();

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(file.getBytes())) {
            System.out.println("Starting to process file: " + file.getOriginalFilename());

            InputStream jrxmlInputStream = getClass().getResourceAsStream("/reports/product_import_template.jrxml");
            if (jrxmlInputStream == null) {
                throw new IllegalStateException("Template 'product_import_template.jrxml' not found in resources/reports/");
            }
            JasperReport jasperReport = JasperCompileManager.compileReport(jrxmlInputStream);

            JRXlsxDataSource dataSource = new JRXlsxDataSource(inputStream);
            dataSource.setUseFirstRowAsHeader(true);
            dataSource.setColumnNames(new String[]{"name", "category_id", "price", "stock", "imageUrl"});

            JRDesignField nameField = new JRDesignField();
            nameField.setName("name");
            nameField.setValueClass(String.class);

            JRDesignField categoryIdField = new JRDesignField();
            categoryIdField.setName("category_id");
            categoryIdField.setValueClass(String.class);

            JRDesignField priceField = new JRDesignField();
            priceField.setName("price");
            priceField.setValueClass(BigDecimal.class);

            JRDesignField stockField = new JRDesignField();
            stockField.setName("stock");
            stockField.setValueClass(Integer.class);

            JRDesignField imageUrlField = new JRDesignField();
            imageUrlField.setName("imageUrl");
            imageUrlField.setValueClass(String.class);

            int rowNum = 2;
            while (dataSource.next()) {
                System.out.println("Processing row: " + rowNum);

                Product product = new Product();

                try {
                    // Thử trích xuất name
                    Object nameObj = dataSource.getFieldValue(nameField);
                    String name = (nameObj != null) ? nameObj.toString() : null;
                    System.out.println("name value: " + name);
                    if (name == null || name.trim().isEmpty()) {
                        System.out.println("Encountered empty or null name at row " + rowNum + ", stopping import.");
                        break; // Thoát nếu name trống
                    }
                    product.setName(name);

                    Object categoryIdObj = dataSource.getFieldValue(categoryIdField);
                    String categoryIdStr = (categoryIdObj != null) ? categoryIdObj.toString() : null;
                    System.out.println("category_id value: " + categoryIdStr);
                    if (categoryIdStr == null) {
                        throw new IllegalArgumentException("Category ID không hợp lệ tại hàng " + rowNum);
                    }
                    UUID categoryId = UUID.fromString(categoryIdStr);
                    Category category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục với ID " + categoryId));
                    product.setCategory(category);

                    Object priceObj = dataSource.getFieldValue(priceField);
                    BigDecimal price = (priceObj != null) ? (BigDecimal) priceObj : null;
                    System.out.println("price value: " + price);
                    if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Giá sản phẩm phải lớn hơn 0 tại hàng " + rowNum);
                    }
                    product.setPrice(price);

                    Object stockObj = dataSource.getFieldValue(stockField);
                    Integer stock = (stockObj != null) ? (Integer) stockObj : null;
                    System.out.println("stock value: " + stock);
                    if (stock == null || stock < 0) {
                        throw new IllegalArgumentException("Số lượng tồn kho không được âm tại hàng " + rowNum);
                    }
                    product.setStock(stock);

                    Object imageUrlObj = dataSource.getFieldValue(imageUrlField);
                    String imageUrl = (imageUrlObj != null) ? imageUrlObj.toString() : null;
                    System.out.println("imageUrl value: " + imageUrl);
                    if (imageUrl != null) {
                        product.setImageUrl(imageUrl);
                    }

                    product.setCreatedAt(LocalDateTime.now());
                    products.add(product);
                } catch (JRException e) {
                    if (e.getMessage().contains("Unable to get value for Excel field")) {
                        System.out.println("Reached end of data at row " + rowNum + ", stopping import.");
                        break; // Thoát khi gặp lỗi do hàng không tồn tại
                    }
                    throw e; // Ném lại lỗi khác nếu có
                }

                rowNum++;
            }

            System.out.println("Import completed, total products: " + products.size());
            return productRepository.saveAll(products);
        } catch (Exception e) {
            System.err.println("Error during import: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
