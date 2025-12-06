package com.shopify.dashboard.service;

import com.shopify.dashboard.config.AppProperties;
import com.shopify.dashboard.dto.shopify.ShopifyCustomersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyOrdersResponse;
import com.shopify.dashboard.dto.shopify.ShopifyProductsResponse;
import com.shopify.dashboard.exception.ShopifyClientException;
import com.shopify.dashboard.exception.ShopifyRateLimitException;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShopifyClient {

    private final WebClient shopifyWebClient;
    private final AppProperties properties;

    public ShopifyCustomersResponse fetchCustomers(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/customers.json".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyCustomersResponse.class);
    }

    public ShopifyOrdersResponse fetchOrders(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/orders.json?status=any".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyOrdersResponse.class);
    }

    public ShopifyProductsResponse fetchProducts(String shopDomain, String accessToken) {
        String uri = "/admin/api/%s/products.json".formatted(properties.getShopify().getApiVersion());
        return get(shopDomain, uri, accessToken, ShopifyProductsResponse.class);
    }

    private <T> T get(String shopDomain, String path, String token, Class<T> type) {
        String fullUrl = "https://" + shopDomain + path;
        Mono<T> requestMono = shopifyWebClient
                .get()
                .uri(fullUrl)
                .accept(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .onStatus(status -> status.value() == HttpStatus.TOO_MANY_REQUESTS.value(),
                        response -> buildRateLimitError(path, response))
                .onStatus(HttpStatusCode::is5xxServerError,
                        response -> buildError(path, response, HttpStatus.BAD_GATEWAY))
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> buildError(path, response, HttpStatus.BAD_REQUEST))
                .bodyToMono(type)
                .timeout(Duration.ofMillis(Math.max(properties.getShopify().getRequestTimeoutMs(), 1000L)));

        if (properties.getShopify().getMaxRetries() > 0) {
            requestMono = requestMono.retryWhen(createRetrySpec());
        }

        return requestMono.block();
    }

    private Retry createRetrySpec() {
        long retries = Math.max(properties.getShopify().getMaxRetries(), 0);
        Duration backoff = Duration.ofSeconds(Math.max(properties.getShopify().getRateLimitBackoffSeconds(), 1));
        return Retry.backoff(retries + 1, backoff)
                .filter(this::isRetryable)
                .onRetryExhaustedThrow((spec, signal) -> signal.failure());
    }

    private boolean isRetryable(Throwable throwable) {
        if (throwable instanceof ShopifyRateLimitException) {
            return true;
        }
        if (throwable instanceof ShopifyClientException clientException) {
            return clientException.getStatus().is5xxServerError();
        }
        return false;
    }

    private Mono<? extends Throwable> buildError(String path, ClientResponse response, HttpStatus status) {
        return response.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> {
                    String truncatedBody = truncate(body);
                    log.warn("Shopify API {} error for {}: {}", status.value(), path, truncatedBody);
                    return Mono.error(new ShopifyClientException(
                            "Shopify responded with %s for %s".formatted(status.value(), path), status));
                });
    }

    private Mono<? extends Throwable> buildRateLimitError(String path, ClientResponse response) {
        Duration retryAfter = parseRetryAfter(response);
        return response.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> {
                    log.warn("Shopify rate limit hit for {}. Retry after {} seconds. Payload: {}", path,
                            retryAfter.getSeconds(), truncate(body));
                    return Mono.error(new ShopifyRateLimitException("Shopify rate limit hit for %s".formatted(path), retryAfter));
                });
    }

    private Duration parseRetryAfter(ClientResponse response) {
        String headerValue = response.headers().asHttpHeaders().getFirst("Retry-After");
        if (headerValue == null) {
            return Duration.ofSeconds(Math.max(properties.getShopify().getRateLimitBackoffSeconds(), 1));
        }
        try {
            return Duration.ofSeconds(Long.parseLong(headerValue));
        } catch (NumberFormatException ex) {
            return Duration.ofSeconds(Math.max(properties.getShopify().getRateLimitBackoffSeconds(), 1));
        }
    }

    private String truncate(String body) {
        if (body == null) {
            return "";
        }
        return body.length() > 500 ? body.substring(0, 500) + "..." : body;
    }
}
