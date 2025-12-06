package com.shopify.dashboard.controller;

import com.shopify.dashboard.config.AppProperties;
import com.shopify.dashboard.dto.ApiResponse;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.exception.UnauthorizedException;
import com.shopify.dashboard.service.ShopifyIngestionService;
import com.shopify.dashboard.service.TenantService;
import com.shopify.dashboard.util.HmacVerifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final HmacVerifier hmacVerifier;
    private final AppProperties properties;
    private final TenantService tenantService;
    private final ShopifyIngestionService ingestionService;

    @PostMapping("/shopify")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(@RequestHeader("X-Shopify-Hmac-Sha256") String hmac,
                                                           @RequestHeader("X-Shopify-Topic") String topic,
                                                           @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
                                                           @RequestBody String payload) {
        if (!hmacVerifier.isValid(payload, hmac, properties.getShopify().getWebhookSecret())) {
            throw new UnauthorizedException("Invalid webhook signature");
        }
        Tenant tenant = tenantService.getTenantByDomain(shopDomain);
        if (!StringUtils.hasText(topic)) {
            log.warn("Webhook topic missing for tenant {}", tenant.getShopDomain());
            return ResponseEntity.ok(ApiResponse.success(null, "Ignored"));
        }
        if (topic.startsWith("customers")) {
            ingestionService.upsertCustomerFromWebhook(tenant, payload);
        } else if (topic.startsWith("orders")) {
            ingestionService.upsertOrderFromWebhook(tenant, payload);
        } else if (topic.startsWith("products")) {
            ingestionService.upsertProductFromWebhook(tenant, payload);
        } else {
            log.info("Unhandled Shopify topic {}", topic);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Webhook processed"));
    }
}
