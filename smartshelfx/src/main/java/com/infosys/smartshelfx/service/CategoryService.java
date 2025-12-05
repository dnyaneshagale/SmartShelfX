package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.CategoryDTO;
import com.infosys.smartshelfx.entity.AuditAction;
import com.infosys.smartshelfx.entity.Category;
import com.infosys.smartshelfx.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(String name, String description) {
        if (categoryRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category already exists with name: " + name);
        }

        Category category = Category.builder()
                .name(name)
                .description(description)
                .build();

        category = categoryRepository.save(category);

        auditLogService.logAction(AuditAction.CREATE, "Category", category.getId(),
                null, category, "name,description");

        return toDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, String name, String description) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));

        Category oldCategory = Category.builder()
                .name(category.getName())
                .description(category.getDescription())
                .build();

        if (name != null && !name.equals(category.getName())) {
            if (categoryRepository.existsByName(name)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Category already exists with name: " + name);
            }
            category.setName(name);
        }

        if (description != null) {
            category.setDescription(description);
        }

        category = categoryRepository.save(category);

        auditLogService.logAction(AuditAction.UPDATE, "Category", category.getId(),
                oldCategory, category, "name,description");

        return toDTO(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + id));

        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete category with existing products");
        }

        auditLogService.logAction(AuditAction.DELETE, "Category", category.getId(),
                category, null, "deleted");

        categoryRepository.delete(category);
    }

    private CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
