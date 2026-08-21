package com.apartment.survival.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.apartment.survival.expense.model.ExpenseCategory;
import com.apartment.survival.expense.model.SplitType;

public interface ExpenseRequest {

    record Create(
        @NotBlank(message = "Expense title is required")
        @Size(min = 2, max = 120, message = "Title must be between 2 and 120 characters")
        String title,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        @Digits(integer = 10, fraction = 2, message = "Amount cannot exceed 10 integer digits and 2 decimals")
        BigDecimal amount,

        @NotNull(message = "Category is required")
        ExpenseCategory category,

        @NotNull(message = "Split type is required")
        SplitType splitType,

        Instant expenseDate,

        @Size(max = 512, message = "Receipt URL cannot exceed 512 characters")
        String receiptUrl,

        @NotEmpty(message = "At least one participant split allocation is required")
        @Valid
        List<SplitItem> splits
    ) {}

    record SplitItem(
        @NotNull(message = "User ID is required for split item")
        UUID userId,

        @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        @Digits(integer = 10, fraction = 2, message = "Split amount cannot exceed 10 integer digits and 2 decimals")
        BigDecimal amount,

        @DecimalMin(value = "0.01", message = "Percentage must be at least 0.01")
        @Digits(integer = 3, fraction = 4, message = "Percentage cannot exceed 3 integer digits and 4 decimals")
        BigDecimal percentage,

        @DecimalMin(value = "0.01", message = "Shares must be at least 0.01")
        @Digits(integer = 4, fraction = 4, message = "Shares cannot exceed 4 integer digits and 4 decimals")
        BigDecimal shares
    ) {}

    record Update(
        @Size(min = 2, max = 120, message = "Title must be between 2 and 120 characters")
        String title,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        ExpenseCategory category,

        Instant expenseDate,

        @Size(max = 512, message = "Receipt URL cannot exceed 512 characters")
        String receiptUrl
    ) {}
}
