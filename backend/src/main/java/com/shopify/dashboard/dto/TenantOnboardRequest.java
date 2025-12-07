package com.shopify.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TenantOnboardRequest(
        @NotBlank @JsonProperty("shopDomain") String shopDomain,
        @NotBlank @JsonProperty("accessToken") String accessToken,
        @Email @NotBlank @JsonProperty("contactEmail") String contactEmail
) {}
