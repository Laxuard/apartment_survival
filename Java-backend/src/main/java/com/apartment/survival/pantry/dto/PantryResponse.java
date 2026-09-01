package com.apartment.survival.pantry.dto;

import java.util.UUID;

public interface PantryResponse {

    record Detail(
        UUID id,
        String name,
        String category,
        String status,
        String badgeLabel,
        int quantity,
        String unit,
        String iconName,
        boolean onGroceryList
    ) {}

    record GroceryToggle(
        UUID id,
        boolean onGroceryList
    ) {}
}
