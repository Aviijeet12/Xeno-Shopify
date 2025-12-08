package com.shopify.dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopify.dashboard.dto.SyncResponse;
import com.shopify.dashboard.dto.shopify.ShopifyCustomersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyOrdersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyProductsResponse;
import com.shopify.dashboard.entity.Customer;
import com.shopify.dashboard.entity.Order;
import com.shopify.dashboard.entity.Product;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.monitoring.SyncMetrics;
import com.shopify.dashboard.repository.CustomerRepository;
import com.shopify.dashboard.repository.OrderRepository;
import com.shopify.dashboard.repository.ProductRepository;
import com.shopify.dashboard.repository.TenantRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.Duration;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShopifyIngestionService {

    private final ShopifyClient shopifyClient;
    private final MockShopifyDataService mockShopifyDataService;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final TenantRepository tenantRepository;
    private final ObjectMapper objectMapper;
    private final SyncMetrics syncMetrics;

    @Transactional
    @Timed(value = "shopify.sync.tenant", extraTags = {"operation", "full"})
    public SyncResponse syncTenant(Tenant tenant) {
        Instant startedAt = Instant.now();
        try {
            long customerCount = syncCustomers(tenant);
            long orderCount = syncOrders(tenant);
            long productCount = syncProducts(tenant);
            Instant finishedAt = Instant.now();
            tenant.setLastSyncAt(finishedAt);
            tenantRepository.save(tenant);
            syncMetrics.recordSyncSuccess(tenant.getId(), customerCount, orderCount, productCount,
                    Duration.between(startedAt, finishedAt));
            return new SyncResponse(tenant.getId(), startedAt, finishedAt, customerCount, orderCount, productCount);
        } catch (RuntimeException ex) {
            syncMetrics.recordSyncFailure(tenant.getId(), ex);
            throw ex;
        }
    }

    @Transactional
    @Timed(value = "shopify.sync.all-tenants", extraTags = {"operation", "scheduler"})
    public void syncAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();
        tenants.forEach(tenant -> {
            try {
                syncTenant(tenant);
            } catch (Exception ex) {
                log.error("Failed to sync tenant {}", tenant.getShopDomain(), ex);
            }
        });
    }

    public long syncCustomers(Tenant tenant) {
        ShopifyCustomersResponse response = mockShopifyDataService.customersFor(tenant.getShopDomain())
                .orElseGet(() -> shopifyClient.fetchCustomers(tenant.getShopDomain(), tenant.getAccessToken()));
        if (response == null || CollectionUtils.isEmpty(response.customers())) {
            return 0;
        }
        response.customers().forEach(customer -> upsertCustomer(tenant.getId(), customer));
        return response.customers().size();
    }

    public long syncOrders(Tenant tenant) {
        ShopifyOrdersResponse response = mockShopifyDataService.ordersFor(tenant.getShopDomain())
                .orElseGet(() -> shopifyClient.fetchOrders(tenant.getShopDomain(), tenant.getAccessToken()));
        if (response == null || CollectionUtils.isEmpty(response.orders())) {
            return 0;
        }
        response.orders().forEach(order -> upsertOrder(tenant.getId(), order));
        return response.orders().size();
    }

    public long syncProducts(Tenant tenant) {
        ShopifyProductsResponse response = mockShopifyDataService.productsFor(tenant.getShopDomain())
                .orElseGet(() -> shopifyClient.fetchProducts(tenant.getShopDomain(), tenant.getAccessToken()));
        if (response == null || CollectionUtils.isEmpty(response.products())) {
            return 0;
        }
        response.products().forEach(product -> upsertProduct(tenant.getId(), product));
        return response.products().size();
    }

    public void upsertCustomerFromWebhook(Tenant tenant, String payload) {
        try {
            JsonNode node = readPayload(payload, "customer");
            ShopifyCustomersResponse.ShopifyCustomer dto = new ShopifyCustomersResponse.ShopifyCustomer(
                    node.path("id").asLong(),
                    textOrNull(node, "email"),
                    textOrNull(node, "first_name"),
                    textOrNull(node, "last_name"),
                    textOrNull(node, "total_spent"),
                    textOrNull(node, "created_at"),
                    textOrNull(node, "updated_at")
            );
            upsertCustomer(tenant.getId(), dto);
        } catch (Exception ex) {
            log.error("Failed to process customer webhook for tenant {}", tenant.getShopDomain(), ex);
        }
    }

    public void upsertOrderFromWebhook(Tenant tenant, String payload) {
        try {
            JsonNode node = readPayload(payload, "order");
            ShopifyOrdersResponse.ShopifyOrder dto = new ShopifyOrdersResponse.ShopifyOrder(
                    node.path("id").asLong(),
                    textOrNull(node, "name"),
                    textOrNull(node, "total_price"),
                    textOrNull(node, "currency"),
                    textOrNull(node, "created_at"),
                    textOrNull(node, "updated_at")
            );
            upsertOrder(tenant.getId(), dto);
        } catch (Exception ex) {
            log.error("Failed to process order webhook for tenant {}", tenant.getShopDomain(), ex);
        }
    }

    public void upsertProductFromWebhook(Tenant tenant, String payload) {
        try {
            JsonNode node = readPayload(payload, "product");
            List<ShopifyProductsResponse.ShopifyVariant> variants = new ArrayList<>();
            if (node.has("variants") && node.get("variants").isArray()) {
                node.get("variants").forEach(variantNode -> variants.add(
                        new ShopifyProductsResponse.ShopifyVariant(textOrNull(variantNode, "price"))));
            }
            ShopifyProductsResponse.ShopifyProduct dto = new ShopifyProductsResponse.ShopifyProduct(
                    node.path("id").asLong(),
                    textOrNull(node, "title"),
                    variants,
                    textOrNull(node, "created_at"),
                    textOrNull(node, "updated_at")
            );
            upsertProduct(tenant.getId(), dto);
        } catch (Exception ex) {
            log.error("Failed to process product webhook for tenant {}", tenant.getShopDomain(), ex);
        }
    }

    private void upsertCustomer(UUID tenantId, ShopifyCustomersResponse.ShopifyCustomer dto) {
        customerRepository.findByTenantIdAndShopCustomerId(tenantId, dto.id())
                .ifPresentOrElse(customer -> updateCustomer(customer, dto),
                        () -> customerRepository.save(buildCustomer(tenantId, dto)));
    }

    private Customer buildCustomer(UUID tenantId, ShopifyCustomersResponse.ShopifyCustomer dto) {
        return Customer.builder()
                .tenantId(tenantId)
                .shopCustomerId(dto.id())
                .email(dto.email())
                .firstName(dto.first_name())
                .lastName(dto.last_name())
                .totalSpent(parseBigDecimal(dto.total_spent()))
                .createdAt(parseInstant(dto.created_at()))
                .updatedAt(parseInstant(dto.updated_at()))
                .build();
    }

    private void updateCustomer(Customer customer, ShopifyCustomersResponse.ShopifyCustomer dto) {
        customer.setEmail(dto.email());
        customer.setFirstName(dto.first_name());
        customer.setLastName(dto.last_name());
        customer.setTotalSpent(parseBigDecimal(dto.total_spent()));
        customer.setUpdatedAt(parseInstant(dto.updated_at()));
        customerRepository.save(customer);
    }

    private void upsertOrder(UUID tenantId, ShopifyOrdersResponse.ShopifyOrder dto) {
        orderRepository.findByTenantIdAndShopOrderId(tenantId, dto.id())
                .ifPresentOrElse(order -> updateOrder(order, dto),
                        () -> orderRepository.save(buildOrder(tenantId, dto)));
    }

    private Order buildOrder(UUID tenantId, ShopifyOrdersResponse.ShopifyOrder dto) {
        return Order.builder()
                .tenantId(tenantId)
                .shopOrderId(dto.id())
                .orderNumber(dto.name())
                .totalPrice(parseBigDecimal(dto.total_price()))
                .currency(dto.currency())
                .createdAt(parseInstant(dto.created_at()))
                .updatedAt(parseInstant(dto.updated_at()))
                .build();
    }

    private void updateOrder(Order order, ShopifyOrdersResponse.ShopifyOrder dto) {
        order.setOrderNumber(dto.name());
        order.setTotalPrice(parseBigDecimal(dto.total_price()));
        order.setCurrency(dto.currency());
        order.setUpdatedAt(parseInstant(dto.updated_at()));
        orderRepository.save(order);
    }

    private void upsertProduct(UUID tenantId, ShopifyProductsResponse.ShopifyProduct dto) {
        productRepository.findByTenantIdAndShopProductId(tenantId, dto.id())
                .ifPresentOrElse(product -> updateProduct(product, dto),
                        () -> productRepository.save(buildProduct(tenantId, dto)));
    }

    private Product buildProduct(UUID tenantId, ShopifyProductsResponse.ShopifyProduct dto) {
        return Product.builder()
                .tenantId(tenantId)
                .shopProductId(dto.id())
                .title(dto.title())
                .price(extractPrice(dto))
                .createdAt(parseInstant(dto.created_at()))
                .updatedAt(parseInstant(dto.updated_at()))
                .build();
    }

    private void updateProduct(Product product, ShopifyProductsResponse.ShopifyProduct dto) {
        product.setTitle(dto.title());
        product.setPrice(extractPrice(dto));
        product.setUpdatedAt(parseInstant(dto.updated_at()));
        productRepository.save(product);
    }

    private BigDecimal extractPrice(ShopifyProductsResponse.ShopifyProduct dto) {
        if (dto.variants() != null && !dto.variants().isEmpty()) {
            return parseBigDecimal(dto.variants().get(0).price());
        }
        return BigDecimal.ZERO;
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return Instant.now();
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ex) {
            return Instant.now();
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO;
        }
    }

    private JsonNode readPayload(String payload, String primaryNode) throws Exception {
        JsonNode node = objectMapper.readTree(payload);
        if (node.has(primaryNode)) {
            return node.get(primaryNode);
        }
        return node;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode child = node.get(field);
        return child != null && !child.isNull() ? child.asText() : null;
    }
}
