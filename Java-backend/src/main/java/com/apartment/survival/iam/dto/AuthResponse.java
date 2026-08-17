package com.apartment.survival.iam.dto;

import java.util.UUID;

public interface AuthResponse {

    public record UserSummary(
        UUID id,
        String email,
        String username
    ) {}

    public record Message(
        String message
    ) {}

}