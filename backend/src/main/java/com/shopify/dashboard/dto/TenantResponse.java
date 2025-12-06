package com.shopify.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record TenantResponse(UUID id, String shopDomain, String contactEmail, Instant createdAt, Instant lastSyncAt) {
}
