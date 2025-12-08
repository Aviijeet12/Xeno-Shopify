package com.shopify.dashboard.service;

import com.shopify.dashboard.dto.CreateProductRequest;
import com.shopify.dashboard.dto.ProductResponse;
import com.shopify.dashboard.entity.Product;
import com.shopify.dashboard.exception.ApiException;
import com.shopify.dashboard.repository.ProductRepository;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final TenantService tenantService;

    public List<ProductResponse> listProducts(UUID tenantId) {
        tenantService.getTenantEntity(tenantId);
        return productRepository.findAllByTenantId(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse createProduct(UUID tenantId, CreateProductRequest request) {
        tenantService.getTenantEntity(tenantId);
        Long shopProductId = pickShopProductId(tenantId, request.shopProductId());
        Product product = Product.builder()
                .tenantId(tenantId)
                .shopProductId(shopProductId)
                .title(request.title())
                .price(request.price())
                .build();
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    private Long pickShopProductId(UUID tenantId, Long requested) {
        if (requested != null) {
            ensureUniqueShopProductId(tenantId, requested);
            return requested;
        }
        Long candidate;
        do {
            long random = Math.abs(ThreadLocalRandom.current().nextLong());
            candidate = random == 0 ? 1L : random;
        } while (productRepository.findByTenantIdAndShopProductId(tenantId, candidate).isPresent());
        return candidate;
    }

    private void ensureUniqueShopProductId(UUID tenantId, Long shopProductId) {
        if (shopProductId == null) {
            return;
        }
        productRepository.findByTenantIdAndShopProductId(tenantId, shopProductId).ifPresent(existing -> {
            throw new ApiException("Product already exists for Shopify product id", HttpStatus.CONFLICT);
        });
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getShopProductId(),
                product.getTitle(),
                product.getPrice(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
