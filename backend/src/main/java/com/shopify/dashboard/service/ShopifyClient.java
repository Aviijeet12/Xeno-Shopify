package com.shopify.dashboard.service;

import com.shopify.dashboard.config.AppProperties;
import com.shopify.dashboard.dto.shopify.ShopifyCustomersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyOrdersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyProductsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class ShopifyClient {

    private final WebClient shopifyWebClient;
    private final AppProperties properties;

    public ShopifyCustomersResponse fetchCustomers(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/customers.json".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyCustomersResponse.class);
    }

    public ShopifyOrdersResponse fetchOrders(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/orders.json?status=any".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyOrdersResponse.class);
    }

    public ShopifyProductsResponse fetchProducts(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/products.json".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyProductsResponse.class);
    }

    private <T> T get(String shopDomain, String path, String token, Class<T> type) {
        return shopifyWebClient
                .get()
                .uri("https://" + shopDomain + path)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .bodyToMono(type)
                .block();
    }
}
