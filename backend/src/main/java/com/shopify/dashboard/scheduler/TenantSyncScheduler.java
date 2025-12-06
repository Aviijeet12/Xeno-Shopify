package com.shopify.dashboard.scheduler;

import com.shopify.dashboard.service.ShopifyIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantSyncScheduler {

    private final ShopifyIngestionService ingestionService;

    @Scheduled(fixedDelay = 300000)
    public void syncTenants() {
        log.debug("Starting scheduled tenant sync");
        ingestionService.syncAllTenants();
    }
}
