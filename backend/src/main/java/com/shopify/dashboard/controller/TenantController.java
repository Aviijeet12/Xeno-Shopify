package com.shopify.dashboard.controller;

import com.shopify.dashboard.dto.ApiResponse;
import com.shopify.dashboard.dto.SyncResponse;
import com.shopify.dashboard.dto.TenantOnboardRequest;
import com.shopify.dashboard.dto.TenantResponse;
import com.shopify.dashboard.service.TenantService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping("/onboard")
    public ResponseEntity<ApiResponse<TenantResponse>> onboard(@Valid @RequestBody TenantOnboardRequest request) {
        return ResponseEntity.ok(ApiResponse.success(tenantService.onboardTenant(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(tenantService.listTenants()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TenantResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(tenantService.getTenant(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Tenant deleted"));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<ApiResponse<SyncResponse>> sync(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(tenantService.triggerSync(id)));
    }
}
