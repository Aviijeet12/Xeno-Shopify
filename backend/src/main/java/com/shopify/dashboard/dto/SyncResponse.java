package com.shopify.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record SyncResponse(UUID tenantId, Instant startedAt, Instant finishedAt, long customersSynced, long ordersSynced, long productsSynced) {
}
