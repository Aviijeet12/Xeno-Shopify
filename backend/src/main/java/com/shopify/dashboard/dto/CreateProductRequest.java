package com.shopify.dashboard.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank String title,
        Long shopProductId,
        @NotNull @DecimalMin(value = "0.01", message = "Price must be positive") BigDecimal price
) {}
