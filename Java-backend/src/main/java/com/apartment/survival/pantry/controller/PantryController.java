package com.apartment.survival.pantry.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.pantry.dto.PantryRequest;
import com.apartment.survival.pantry.dto.PantryResponse;
import com.apartment.survival.pantry.service.PantryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/pantry")
public class PantryController {

    private final PantryService pantryService;

    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<List<PantryResponse.Detail>> getItems(@PathVariable UUID householdId) {
        List<PantryResponse.Detail> response = pantryService.getItems(householdId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<PantryResponse.Detail> createItem(
            @PathVariable UUID householdId,
            @Valid @RequestBody PantryRequest.Create request) {
        PantryResponse.Detail response = pantryService.createItem(householdId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{itemId}/stock")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<PantryResponse.Detail> updateStock(
            @PathVariable UUID householdId,
            @PathVariable UUID itemId,
            @Valid @RequestBody PantryRequest.UpdateStock request) {
        PantryResponse.Detail response = pantryService.updateStock(householdId, itemId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{itemId}/grocery")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<PantryResponse.GroceryToggle> toggleGrocery(
            @PathVariable UUID householdId,
            @PathVariable UUID itemId,
            @Valid @RequestBody PantryRequest.ToggleGrocery request) {
        PantryResponse.GroceryToggle response = pantryService.toggleGrocery(householdId, itemId, request);
        return ResponseEntity.ok(response);
    }
}
