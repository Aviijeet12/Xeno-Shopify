package com.shopify.dashboard.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopify.dashboard.dto.shopify.ShopifyCustomersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyOrdersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyProductsResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockShopifyDataService {

    private static final String MOCK_DATA_PATH = "mock-data/mock-tenants.json";
    private final Map<String, MockTenantData> datasets = new ConcurrentHashMap<>();

    public MockShopifyDataService(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource(MOCK_DATA_PATH);
        if (!resource.exists()) {
            log.info("No mock Shopify data found at {}", MOCK_DATA_PATH);
            return;
        }
        try (InputStream inputStream = resource.getInputStream()) {
            MockTenantFile file = objectMapper.readValue(inputStream, MockTenantFile.class);
            if (file != null && file.tenants() != null) {
                file.tenants().forEach(this::registerTenant);
                log.info("Loaded {} mock Shopify tenant dataset(s)", datasets.size());
            }
        } catch (IOException ex) {
            log.warn("Failed to load mock Shopify data", ex);
        }
    }

    public Optional<ShopifyCustomersResponse> customersFor(String shopDomain) {
        return findTenantData(shopDomain).map(MockTenantData::customers);
    }

    public Optional<ShopifyOrdersResponse> ordersFor(String shopDomain) {
        return findTenantData(shopDomain).map(MockTenantData::orders);
    }

    public Optional<ShopifyProductsResponse> productsFor(String shopDomain) {
        return findTenantData(shopDomain).map(MockTenantData::products);
    }

    private Optional<MockTenantData> findTenantData(String shopDomain) {
        if (shopDomain == null || datasets.isEmpty()) {
            return Optional.empty();
        }
        String normalized = normalize(shopDomain);
        MockTenantData direct = datasets.get(normalized);
        if (direct != null) {
            return Optional.of(direct);
        }
        if (normalized.contains("decor") || normalized.contains("home")) {
            return Optional.ofNullable(datasets.get("home-decor"));
        }
        if (normalized.contains("tech") || normalized.contains("gadget")) {
            return Optional.ofNullable(datasets.get("tech-gadgets"));
        }
        return Optional.empty();
    }

    private void registerTenant(MockTenantData tenant) {
        if (tenant == null) {
            return;
        }
        String primaryKey = normalize(tenant.shopDomain());
        if (!primaryKey.isEmpty()) {
            datasets.put(primaryKey, tenant);
        }
        if (tenant.aliases() != null) {
            tenant.aliases().stream()
                    .filter(alias -> alias != null && !alias.isBlank())
                    .map(this::normalize)
                    .filter(alias -> !alias.isEmpty())
                    .forEach(alias -> datasets.put(alias, tenant));
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MockTenantFile(List<MockTenantData> tenants) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MockTenantData(
            String shopDomain,
            List<String> aliases,
            ShopifyCustomersResponse customers,
            ShopifyOrdersResponse orders,
            ShopifyProductsResponse products
    ) {}
}
