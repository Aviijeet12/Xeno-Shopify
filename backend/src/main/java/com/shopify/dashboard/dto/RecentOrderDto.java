package com.shopify.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecentOrderDto(UUID id, String orderNumber, BigDecimal totalPrice, String currency, Instant createdAt) {
}
