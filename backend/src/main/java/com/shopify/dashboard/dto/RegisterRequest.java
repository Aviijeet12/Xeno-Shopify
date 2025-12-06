package com.shopify.dashboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotNull UUID tenantId
) {}
