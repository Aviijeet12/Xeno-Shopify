package com.shopify.dashboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TenantOnboardRequest(
        @NotBlank String shopDomain,
        @NotBlank String accessToken,
        @Email @NotBlank String contactEmail
) {}
