package com.apartment.survival.household.dto;

import java.time.ZoneId;
import java.util.Currency;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.apartment.survival.household.model.HouseholdRole;

public interface HouseholdRequest {

    record Create(
        @NotBlank(message = "Household name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String description,

        Currency currency,
        ZoneId timezone
    ) {}

    record Update(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String description,

        @Size(max = 512, message = "Avatar URL cannot exceed 512 characters")
        String avatarUrl,

        Currency currency,
        ZoneId timezone,

        @Min(value = 1, message = "Max members must be at least 1")
        @Max(value = 100, message = "Max members cannot exceed 100")
        Integer maxMembers
    ) {}

    record UpdateMember(
        @NotNull(message = "Role is required")
        HouseholdRole role,

        @Size(max = 50, message = "Nickname cannot exceed 50 characters")
        String nickname
    ) {}
}
