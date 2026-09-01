package com.apartment.survival.household.dto;

import java.math.BigDecimal;
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
        ZoneId timezone,

        @Min(value = 0, message = "Monthly budget cannot be negative")
        BigDecimal monthlyBudget,

        @Size(max = 100, message = "WiFi SSID cannot exceed 100 characters")
        String wifiSsid,

        @Size(max = 100, message = "WiFi password cannot exceed 100 characters")
        String wifiPassword,

        @Size(max = 30, message = "Split algorithm cannot exceed 30 characters")
        String splitAlgorithm,

        @Size(max = 30, message = "Default split method cannot exceed 30 characters")
        String defaultSplitMethod,

        @Size(max = 2048, message = "Default split allocations cannot exceed 2048 characters")
        String defaultSplitAllocations,

        Boolean autoRestockFromExpenses,

        @Min(value = 1, message = "Max members must be at least 1")
        @Max(value = 100, message = "Max members cannot exceed 100")
        Integer maxMembers
    ) {
        public Create(String name, String description, Currency currency, ZoneId timezone) {
            this(name, description, currency, timezone, null, null, null, null, null, null, null, null);
        }
    }

    record Update(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String description,

        @Size(max = 512, message = "Avatar URL cannot exceed 512 characters")
        String avatarUrl,

        Currency currency,
        ZoneId timezone,

        @Min(value = 0, message = "Monthly budget cannot be negative")
        BigDecimal monthlyBudget,

        @Size(max = 100, message = "WiFi SSID cannot exceed 100 characters")
        String wifiSsid,

        @Size(max = 100, message = "WiFi password cannot exceed 100 characters")
        String wifiPassword,

        @Size(max = 30, message = "Split algorithm cannot exceed 30 characters")
        String splitAlgorithm,

        @Size(max = 30, message = "Default split method cannot exceed 30 characters")
        String defaultSplitMethod,

        @Size(max = 2048, message = "Default split allocations cannot exceed 2048 characters")
        String defaultSplitAllocations,

        Boolean autoRestockFromExpenses,

        @Min(value = 1, message = "Max members must be at least 1")
        @Max(value = 100, message = "Max members cannot exceed 100")
        Integer maxMembers
    ) {
        public Update(String name, String description, String avatarUrl, Currency currency, ZoneId timezone, Integer maxMembers) {
            this(name, description, avatarUrl, currency, timezone, null, null, null, null, null, null, null, maxMembers);
        }
    }

    record UpdateMember(
        @NotNull(message = "Role is required")
        HouseholdRole role,

        @Size(max = 50, message = "Nickname cannot exceed 50 characters")
        String nickname
    ) {}
}
