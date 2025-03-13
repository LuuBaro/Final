package com.example.workflow.service;

import com.example.workflow.model.Category;
import com.example.workflow.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Thêm mới một loại sản phẩm
    @Transactional
    public Category createCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên loại sản phẩm không được để trống");
        }
        return categoryRepository.save(category);
    }

    // Cập nhật thông tin loại sản phẩm
    @Transactional
    public Category updateCategory(UUID categoryId, Category categoryDetails) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại sản phẩm"));

        if (categoryDetails.getName() != null && !categoryDetails.getName().trim().isEmpty()) {
            category.setName(categoryDetails.getName());
        }
        if (categoryDetails.getDescription() != null) {
            category.setDescription(categoryDetails.getDescription());
        }

        return categoryRepository.save(category);
    }

    // Xóa loại sản phẩm
    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại sản phẩm"));
        categoryRepository.delete(category);
    }

    // Lấy tất cả loại sản phẩm
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy thông tin một loại sản phẩm theo ID
    public Category getCategoryById(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại sản phẩm"));
    }
}
