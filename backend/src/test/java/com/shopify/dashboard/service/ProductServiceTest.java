package com.shopify.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.shopify.dashboard.dto.CreateProductRequest;
import com.shopify.dashboard.dto.ProductResponse;
import com.shopify.dashboard.entity.Product;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.exception.ApiException;
import com.shopify.dashboard.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private TenantService tenantService;

    @InjectMocks
    private ProductService productService;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        when(tenantService.getTenantEntity(tenantId))
                .thenReturn(Tenant.builder().id(tenantId).shopDomain("demo").build());
    }

    @Test
    void listProductsReturnsMappedResponses() {
        Product product = Product.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .shopProductId(1001L)
                .title("Aurora Sofa")
                .price(new BigDecimal("1899.00"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        when(productRepository.findAllByTenantId(tenantId)).thenReturn(List.of(product));

        List<ProductResponse> responses = productService.listProducts(tenantId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("Aurora Sofa");
        assertThat(responses.get(0).shopProductId()).isEqualTo(1001L);
    }

    @Test
    void createProductRejectsDuplicateShopProductId() {
        when(productRepository.findByTenantIdAndShopProductId(tenantId, 2002L)).thenReturn(Optional.of(Product.builder().build()));
        CreateProductRequest request = new CreateProductRequest("Duplicate", 2002L, BigDecimal.ONE);

        assertThrows(ApiException.class, () -> productService.createProduct(tenantId, request));
    }

    @Test
    void createProductGeneratesIdentifierWhenMissing() {
        when(productRepository.findByTenantIdAndShopProductId(eq(tenantId), anyLong())).thenReturn(Optional.empty());
        Product saved = Product.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .shopProductId(5555L)
                .title("New Lamp")
                .price(BigDecimal.TEN)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        when(productRepository.save(any(Product.class))).thenReturn(saved);

        CreateProductRequest request = new CreateProductRequest("New Lamp", null, BigDecimal.TEN);
        ProductResponse response = productService.createProduct(tenantId, request);

        assertThat(response.shopProductId()).isEqualTo(5555L);
        assertThat(response.title()).isEqualTo("New Lamp");
    }
}
