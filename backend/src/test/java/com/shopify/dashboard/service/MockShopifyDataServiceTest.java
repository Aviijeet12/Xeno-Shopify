package com.shopify.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class MockShopifyDataServiceTest {

    private final MockShopifyDataService service = new MockShopifyDataService(new ObjectMapper());

    @Test
    void loadsHomeDecorDatasetWhenDomainContainsKeyword() {
        assertTrue(service.productsFor("home-decor-demo.myshopify.com").isPresent(),
                "Expected curated products for home decor tenants");
    }

    @Test
    void loadsTechDatasetWhenDomainContainsKeyword() {
        assertTrue(service.customersFor("tech-gadgets-lab.myshopify.com").isPresent(),
                "Expected curated customers for tech gadget tenants");
    }

    @Test
    void leavesNonMockedDomainsUntouched() {
        assertFalse(service.ordersFor("actual-store.myshopify.com").isPresent(),
                "Unknown tenants should still hit the real Shopify API");
    }
}
