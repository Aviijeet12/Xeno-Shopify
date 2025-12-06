package com.shopify.dashboard.repository;

import com.shopify.dashboard.entity.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    long countByTenantId(UUID tenantId);

    @Query("select coalesce(sum(o.totalPrice), 0) from Order o where o.tenantId = :tenantId")
    BigDecimal sumTotalPriceByTenantId(@Param("tenantId") UUID tenantId);

    List<Order> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    List<Order> findAllByTenantId(UUID tenantId);

    List<Order> findAllByTenantIdAndCreatedAtBetween(UUID tenantId, Instant from, Instant to);

    Optional<Order> findByTenantIdAndShopOrderId(UUID tenantId, Long shopOrderId);
}
