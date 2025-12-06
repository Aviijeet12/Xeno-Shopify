package com.shopify.dashboard.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.shopify.dashboard.entity.Tenant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@ExtendWith(SpringExtension.class)
class TenantRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    void findByShopDomainReturnsTenant() {
        Tenant tenant = tenantRepository.save(Tenant.builder()
                .shopDomain("metrics-test.myshopify.com")
                .accessToken("token")
                .contactEmail("ops@example.com")
                .build());

        Optional<Tenant> result = tenantRepository.findByShopDomain("metrics-test.myshopify.com");

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(tenant.getId());
    }
}
