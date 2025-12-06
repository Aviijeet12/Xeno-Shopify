package com.shopify.dashboard.repository;

import com.shopify.dashboard.entity.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    long countByTenantId(UUID tenantId);

    Optional<Product> findByTenantIdAndShopProductId(UUID tenantId, Long shopProductId);

    List<Product> findAllByTenantId(UUID tenantId);
}
