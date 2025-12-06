package com.shopify.dashboard.monitoring;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SyncMetrics {

    private final MeterRegistry meterRegistry;

    public void recordSyncSuccess(UUID tenantId, long customers, long orders, long products, Duration duration) {
        Tags tags = Tags.of("tenantId", tenantId.toString());
        meterRegistry.counter("shopify.sync.success", tags).increment();
        meterRegistry.summary("shopify.sync.records.customers", tags).record(customers);
        meterRegistry.summary("shopify.sync.records.orders", tags).record(orders);
        meterRegistry.summary("shopify.sync.records.products", tags).record(products);
        meterRegistry.timer("shopify.sync.duration", tags).record(duration);
    }

    public void recordSyncFailure(UUID tenantId, Throwable throwable) {
        Tags tags = Tags.of(
                "tenantId", tenantId.toString(),
                "exception", throwable == null ? "unknown" : throwable.getClass().getSimpleName());
        meterRegistry.counter("shopify.sync.failure", tags).increment();
    }

    public void recordWebhookEvent(String topic, boolean success) {
        meterRegistry.counter("shopify.webhook.events",
                "topic", topic,
                "status", success ? "success" : "failed").increment();
    }
}
