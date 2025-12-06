package com.shopify.dashboard.config;

import com.shopify.dashboard.entity.User;
import com.shopify.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements ApplicationRunner {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        String email = appProperties.getAdmin().getEmail();
        String password = appProperties.getAdmin().getPassword();

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.warn("Skipping admin bootstrap because app.admin credentials are not configured");
            return;
        }

        userRepository.findByEmail(email).ifPresentOrElse(
                existing -> log.info("Admin user {} already exists", email),
                () -> {
                    User admin = User.builder()
                            .email(email)
                            .passwordHash(passwordEncoder.encode(password))
                            .role("PLATFORM_ADMIN")
                            .build();
                    userRepository.save(admin);
                    log.info("Seeded default platform admin {}", email);
                }
        );
    }
}
