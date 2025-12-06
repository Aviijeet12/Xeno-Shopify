package com.shopify.dashboard.dto.shopify;

import java.util.List;

public record ShopifyOrdersResponse(List<ShopifyOrder> orders) {

    public record ShopifyOrder(
            Long id,
            String name,
            String total_price,
            String currency,
            String created_at,
            String updated_at
    ) {}
}
