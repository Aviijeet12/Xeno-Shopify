package com.shopify.dashboard.repository;

import com.shopify.dashboard.entity.Customer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    long countByTenantId(UUID tenantId);

    Optional<Customer> findByTenantIdAndShopCustomerId(UUID tenantId, Long shopCustomerId);

    List<Customer> findByTenantIdOrderByTotalSpentDesc(UUID tenantId, Pageable pageable);

    List<Customer> findAllByTenantId(UUID tenantId);
}
