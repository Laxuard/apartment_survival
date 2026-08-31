package com.apartment.survival.iam.dto;

import java.time.Instant;
import java.util.UUID;

import com.apartment.survival.iam.model.Role;

public interface UserResponse {

    record ProfileDetail(
        UUID userId,
        String username,
        String email,
        Role role,
        Instant createdAt
    ) {}
}
