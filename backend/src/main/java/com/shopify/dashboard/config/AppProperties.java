package com.shopify.dashboard.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Security security = new Security();
    private final Shopify shopify = new Shopify();

    @Data
    public static class Security {
        private final Jwt jwt = new Jwt();

        @Data
        public static class Jwt {
            private String secret;
            private long expirationSeconds;
        }
    }

    @Data
    public static class Shopify {
        private String apiVersion;
        private String webhookSecret;
        private long requestTimeoutMs;
    }
}
