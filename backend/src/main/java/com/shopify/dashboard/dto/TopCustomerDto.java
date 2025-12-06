package com.shopify.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TopCustomerDto(UUID id, String email, String firstName, String lastName, BigDecimal totalSpent, Instant updatedAt) {
}
