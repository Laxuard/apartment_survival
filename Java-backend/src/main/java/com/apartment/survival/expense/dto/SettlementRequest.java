package com.apartment.survival.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public interface SettlementRequest {

    record Create(
        @NotNull(message = "Recipient user ID is required")
        UUID recipientUserId,

        @NotNull(message = "Settlement amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        @Digits(integer = 10, fraction = 2, message = "Amount cannot exceed 10 integer digits and 2 decimals")
        BigDecimal amount,

        @PastOrPresent(message = "Settlement date cannot be in the future")
        Instant settledAt,

        @Size(max = 255, message = "Notes cannot exceed 255 characters")
        String notes
    ) {}
}
