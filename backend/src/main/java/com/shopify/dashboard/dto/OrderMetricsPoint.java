package com.shopify.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OrderMetricsPoint(LocalDate date, long orderCount, BigDecimal totalSales) {
}
