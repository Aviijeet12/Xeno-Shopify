package com.shopify.dashboard.service;

import com.shopify.dashboard.dto.AuthRequest;
import com.shopify.dashboard.dto.AuthResponse;
import com.shopify.dashboard.dto.RegisterRequest;
import com.shopify.dashboard.entity.Tenant;
import com.shopify.dashboard.entity.User;
import com.shopify.dashboard.exception.ApiException;
import com.shopify.dashboard.exception.UnauthorizedException;
import com.shopify.dashboard.repository.UserRepository;
import com.shopify.dashboard.security.JwtTokenService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(existing -> {
            throw new ApiException("User already exists", HttpStatus.CONFLICT);
        });
        Tenant tenant = tenantService.getTenantEntity(request.tenantId());
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .tenantId(tenant.getId())
                .role("TENANT_ADMIN")
                .build();
        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtTokenService.generateToken(user);
        return new AuthResponse(token, jwtTokenService.getExpirationSeconds(), user.getId(), user.getTenantId(), user.getRole(), Instant.now());
    }
}
