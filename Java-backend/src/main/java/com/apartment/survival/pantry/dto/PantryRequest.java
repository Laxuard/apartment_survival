package com.apartment.survival.pantry.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public interface PantryRequest {

    record Create(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name cannot exceed 120 characters")
        String name,

        @NotBlank(message = "Category is required")
        @Size(max = 60, message = "Category cannot exceed 60 characters")
        String category,

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        @Size(max = 30, message = "Unit cannot exceed 30 characters")
        String unit,

        @Size(max = 30, message = "Icon name cannot exceed 30 characters")
        String iconName
    ) {
        public Create {
            if (quantity == null) {
                quantity = 1;
            }
            if (iconName == null || iconName.isBlank()) {
                iconName = "bread";
            }
        }
    }

    record UpdateStock(
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        String status,

        String badgeLabel
    ) {}

    record ToggleGrocery(
        @NotNull(message = "onGroceryList flag is required")
        Boolean onGroceryList
    ) {}
}
