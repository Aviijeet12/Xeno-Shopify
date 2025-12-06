package com.shopify.dashboard.exception;

import org.springframework.http.HttpStatus;

public class ShopifyClientException extends ApiException {

    public ShopifyClientException(String message, HttpStatus status) {
        super(message, status);
    }
}
