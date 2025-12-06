package com.shopify.dashboard.dto.shopify;

import java.util.List;

public record ShopifyProductsResponse(List<ShopifyProduct> products) {

    public record ShopifyProduct(
            Long id,
            String title,
            List<ShopifyVariant> variants,
            String created_at,
            String updated_at
    ) {}

    public record ShopifyVariant(
            String price
    ) {}
}
