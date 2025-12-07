package com.shopify.dashboard.repository;

import com.shopify.dashboard.entity.Tenant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByShopDomain(String shopDomain);
}
