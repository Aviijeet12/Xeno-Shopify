package com.shopify.dashboard.exception;

import java.time.Duration;
import org.springframework.http.HttpStatus;

public class ShopifyRateLimitException extends ShopifyClientException {

    private final Duration retryAfter;

    public ShopifyRateLimitException(String message, Duration retryAfter) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }
}
