package com.apartment.survival.iam.dto;

import java.util.UUID;

public interface AuthResponse {

    record UserSummary(
        UUID userId,
        String email,
        String username
    ) {}

    record Message(
        String message
    ) {}
}