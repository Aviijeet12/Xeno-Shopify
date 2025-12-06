package com.shopify.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(String token, long expiresInSeconds, UUID userId, UUID tenantId, String role, Instant issuedAt) {
}
