package com.shopify.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        Long shopProductId,
        String title,
        BigDecimal price,
        Instant createdAt,
        Instant updatedAt
) {}
