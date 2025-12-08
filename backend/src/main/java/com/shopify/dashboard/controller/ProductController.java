package com.shopify.dashboard.controller;

import com.shopify.dashboard.dto.ApiResponse;
import com.shopify.dashboard.dto.CreateProductRequest;
import com.shopify.dashboard.dto.ProductResponse;
import com.shopify.dashboard.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/{tenantId}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(ApiResponse.success(productService.listProducts(tenantId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@PathVariable UUID tenantId,
                                                               @Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Product created"));
    }
}
