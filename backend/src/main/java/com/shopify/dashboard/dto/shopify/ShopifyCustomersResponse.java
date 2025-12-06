package com.shopify.dashboard.dto.shopify;

import java.util.List;

public record ShopifyCustomersResponse(List<ShopifyCustomer> customers) {

    public record ShopifyCustomer(
            Long id,
            String email,
            String first_name,
            String last_name,
            String total_spent,
            String created_at,
            String updated_at
    ) {}
}
