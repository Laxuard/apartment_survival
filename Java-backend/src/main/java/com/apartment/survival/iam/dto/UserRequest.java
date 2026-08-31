package com.apartment.survival.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public interface UserRequest {

    record UpdateProfile(
            @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

            @NotBlank(message = "Email cannot be blank") @Email(message = "Email must be valid") String email) {
    }

    record ChangePassword(
            @NotBlank(message = "Current password cannot be blank") String currentPassword,

            @NotBlank(message = "New password cannot be blank") @Size(min = 8, message = "New password must be at least 8 characters long") String newPassword) {
    }
}
