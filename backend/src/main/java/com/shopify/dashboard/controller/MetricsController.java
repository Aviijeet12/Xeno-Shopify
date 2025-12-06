package com.shopify.dashboard.controller;

import com.shopify.dashboard.dto.ApiResponse;
import com.shopify.dashboard.dto.MetricsOverviewDto;
import com.shopify.dashboard.dto.OrderMetricsPoint;
import com.shopify.dashboard.dto.RecentOrderDto;
import com.shopify.dashboard.dto.TopCustomerDto;
import com.shopify.dashboard.service.MetricsService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/{tenantId}/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<MetricsOverviewDto>> overview(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(ApiResponse.success(metricsService.getOverview(tenantId)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderMetricsPoint>>> orders(
            @PathVariable UUID tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(metricsService.getOrderMetrics(tenantId, from, to)));
    }

    @GetMapping("/top-customers")
    public ResponseEntity<ApiResponse<List<TopCustomerDto>>> topCustomers(@PathVariable UUID tenantId,
                                                                          @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(metricsService.getTopCustomers(tenantId, limit)));
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<ApiResponse<List<RecentOrderDto>>> recentOrders(@PathVariable UUID tenantId,
                                                                          @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(metricsService.getRecentOrders(tenantId, limit)));
    }
}
