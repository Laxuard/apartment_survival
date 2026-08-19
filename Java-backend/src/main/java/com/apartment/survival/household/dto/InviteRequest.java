package com.apartment.survival.household.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public interface InviteRequest {

    // === 1. Shareable Link / Code Generation ===
    record CreateLink(
        @Min(value = 1, message = "Max uses must be at least 1")
        @Max(value = 100, message = "Max uses cannot exceed household capacity limit of 100")
        Integer maxUses, // Nullable: null represents unlimited uses (bounded by household capacity)

        @Min(value = 1, message = "Expiration must be at least 1 day")
        @Max(value = 30, message = "Expiration cannot exceed 30 days")
        Integer validDays
    ) {
        public CreateLink {
            if (validDays == null) {
                validDays = 7;
            }
        }
    }

    // === 2. Direct Invite by Registered Username ===
    record CreateDirect(
        @NotBlank(message = "Username is required")
        String username,

        @Min(value = 1, message = "Expiration must be at least 1 day")
        @Max(value = 30, message = "Expiration cannot exceed 30 days")
        Integer validDays
    ) {
        public CreateDirect {
            if (validDays == null) {
                validDays = 7;
            }
        }
    }

    // === 3. Join Household with Code ===
    record JoinWithCode(
        @NotBlank(message = "Invite code is required")
        @Pattern(regexp = "^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$", message = "Invite code must match XXXX-XXXX format")
        String code
    ) {}
}
