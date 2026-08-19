package com.apartment.survival.iam.api;

import java.util.UUID;

public record UserPublicDto(
    UUID userId,
    String username,
    String email
) {}
