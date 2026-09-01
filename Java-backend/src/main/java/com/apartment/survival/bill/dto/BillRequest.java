package com.apartment.survival.bill.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public interface BillRequest {

    record Create(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title cannot exceed 120 characters")
        String title,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        @Min(value = 0, message = "Due days cannot be negative")
        Integer dueDays,

        Boolean autoSplit,

        @Size(max = 30, message = "Icon name cannot exceed 30 characters")
        String iconName
    ) {
        public Create {
            if (dueDays == null) {
                dueDays = 7;
            }
            if (autoSplit == null) {
                autoSplit = false;
            }
            if (iconName == null || iconName.isBlank()) {
                iconName = "home";
            }
        }
    }
}
