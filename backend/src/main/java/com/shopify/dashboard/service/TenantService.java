package com.shopify.dashboard.service;

import com.shopify.dashboard.dto.SyncResponse;
import com.shopify.dashboard.dto.TenantOnboardRequest;
import com.shopify.dashboard.dto.TenantResponse;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.exception.ApiException;
import com.shopify.dashboard.exception.NotFoundException;
import com.shopify.dashboard.repository.TenantRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final ShopifyIngestionService ingestionService;

    @Transactional
    public TenantResponse onboardTenant(TenantOnboardRequest request) {
        if (tenantRepository.findByShopDomain(request.shopDomain()).isPresent()) {
            throw new ApiException("Tenant already exists for domain", HttpStatus.CONFLICT);
        }
        Tenant tenant = Tenant.builder()
                .shopDomain(request.shopDomain())
                .accessToken(request.accessToken())
                .contactEmail(request.contactEmail())
                .createdAt(Instant.now())
                .build();
        Tenant saved = tenantRepository.save(tenant);
        return toResponse(saved);
    }

    public List<TenantResponse> listTenants() {
        return tenantRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TenantResponse getTenant(UUID id) {
        return toResponse(getTenantEntity(id));
    }

    @Transactional
    public void deleteTenant(UUID id) {
        Tenant tenant = getTenantEntity(id);
        tenantRepository.delete(tenant);
    }

    @Transactional
    public SyncResponse triggerSync(UUID tenantId) {
        Tenant tenant = getTenantEntity(tenantId);
        return ingestionService.syncTenant(tenant);
    }

    public Tenant getTenantEntity(UUID tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
    }

    public Tenant getTenantByDomain(String domain) {
        return tenantRepository.findByShopDomain(domain)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
    }

    private TenantResponse toResponse(Tenant tenant) {
        return new TenantResponse(tenant.getId(), tenant.getShopDomain(), tenant.getContactEmail(), tenant.getCreatedAt(), tenant.getLastSyncAt());
    }
}
