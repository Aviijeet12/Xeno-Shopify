package com.shopify.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MetricsOverviewDto(long customerCount,
                                 long orderCount,
                                 long productCount,
                                 BigDecimal totalRevenue,
                                 Instant lastSyncAt) {
}
