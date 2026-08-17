package com.apartment.survival.iam.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public interface AuthRequest {

    public record Login(
        @NotBlank String login,
        @NotBlank String password
    ) {}

    public record Register(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Size(min = 8, max = 100) String password
    ) {}

}