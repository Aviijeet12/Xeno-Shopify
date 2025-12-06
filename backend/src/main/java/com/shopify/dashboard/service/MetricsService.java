package com.shopify.dashboard.service;

import com.shopify.dashboard.dto.MetricsOverviewDto;
import com.shopify.dashboard.dto.OrderMetricsPoint;
import com.shopify.dashboard.dto.RecentOrderDto;
import com.shopify.dashboard.dto.TopCustomerDto;
import com.shopify.dashboard.entity.Customer;
import com.shopify.dashboard.entity.Order;
import com.shopify.dashboard.entity.Product;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.repository.CustomerRepository;
import com.shopify.dashboard.repository.OrderRepository;
import com.shopify.dashboard.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final TenantService tenantService;

    public MetricsOverviewDto getOverview(UUID tenantId) {
        Tenant tenant = tenantService.getTenantEntity(tenantId);
        long customers = customerRepository.countByTenantId(tenantId);
        long orders = orderRepository.countByTenantId(tenantId);
        long products = productRepository.countByTenantId(tenantId);
        BigDecimal totalRevenue = orderRepository.sumTotalPriceByTenantId(tenantId);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        return new MetricsOverviewDto(customers, orders, products, totalRevenue, tenant.getLastSyncAt());
    }

    public List<OrderMetricsPoint> getOrderMetrics(UUID tenantId, LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        List<Order> orders = orderRepository.findAllByTenantIdAndCreatedAtBetween(tenantId, fromInstant, toInstant);
        Map<LocalDate, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(order -> LocalDate.ofInstant(order.getCreatedAt(), ZoneOffset.UTC)));
        List<OrderMetricsPoint> points = new ArrayList<>();
        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            List<Order> dayOrders = grouped.getOrDefault(cursor, List.of());
            long count = dayOrders.size();
            BigDecimal sum = dayOrders.stream()
                    .map(order -> order.getTotalPrice() == null ? BigDecimal.ZERO : order.getTotalPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            points.add(new OrderMetricsPoint(cursor, count, sum));
            cursor = cursor.plusDays(1);
        }
        return points;
    }

    public List<TopCustomerDto> getTopCustomers(UUID tenantId, int limit) {
        int pageSize = Math.max(limit, 1);
        return customerRepository.findByTenantIdOrderByTotalSpentDesc(tenantId, PageRequest.of(0, pageSize)).stream()
                .map(this::toTopCustomerDto)
                .toList();
    }

    public List<RecentOrderDto> getRecentOrders(UUID tenantId, int limit) {
        int pageSize = Math.max(limit, 1);
        return orderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(0, pageSize)).stream()
                .map(this::toRecentOrderDto)
                .toList();
    }

    private TopCustomerDto toTopCustomerDto(Customer customer) {
        return new TopCustomerDto(customer.getId(), customer.getEmail(), customer.getFirstName(), customer.getLastName(),
                customer.getTotalSpent(), customer.getUpdatedAt());
    }

    private RecentOrderDto toRecentOrderDto(Order order) {
        return new RecentOrderDto(order.getId(), order.getOrderNumber(), order.getTotalPrice(), order.getCurrency(), order.getCreatedAt());
    }
}
