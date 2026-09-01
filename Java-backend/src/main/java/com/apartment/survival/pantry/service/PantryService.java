package com.apartment.survival.pantry.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.pantry.dto.PantryRequest;
import com.apartment.survival.pantry.dto.PantryResponse;
import com.apartment.survival.pantry.model.PantryItem;
import com.apartment.survival.pantry.repository.PantryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PantryService {

    private final PantryRepository pantryRepository;
    private final HouseholdPublicApi householdPublicApi;

    @Transactional(readOnly = true)
    public List<PantryResponse.Detail> getItems(UUID householdId) {
        if (!householdPublicApi.existsActive(householdId)) {
            throw new ResourceNotFoundException("Household not found: " + householdId);
        }
        return pantryRepository.findActiveByHouseholdId(householdId).stream()
                .map(this::toDetail)
                .toList();
    }

    @Transactional
    public PantryResponse.Detail createItem(UUID householdId, PantryRequest.Create request) {
        if (!householdPublicApi.existsActive(householdId)) {
            throw new ResourceNotFoundException("Household not found: " + householdId);
        }

        int qty = request.quantity();
        String status = computeStatus(qty);
        String badgeLabel = computeBadgeLabel(qty);
        boolean onList = qty <= 1;

        PantryItem item = PantryItem.builder()
                .householdId(householdId)
                .name(request.name().trim())
                .category(request.category().trim())
                .quantity(qty)
                .unit(request.unit() != null ? request.unit().trim() : null)
                .status(status)
                .badgeLabel(badgeLabel)
                .iconName(request.iconName() != null ? request.iconName().trim().toLowerCase() : "bread")
                .onGroceryList(onList)
                .deleted(false)
                .build();

        PantryItem saved = pantryRepository.save(item);
        return toDetail(saved);
    }

    @Transactional
    public PantryResponse.Detail updateStock(UUID householdId, UUID itemId, PantryRequest.UpdateStock request) {
        PantryItem item = pantryRepository.findByIdAndHouseholdId(itemId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Pantry item not found: " + itemId));

        int qty = request.quantity();
        item.setQuantity(qty);

        String status = request.status() != null && !request.status().isBlank()
                ? request.status()
                : computeStatus(qty);
        String badgeLabel = request.badgeLabel() != null && !request.badgeLabel().isBlank()
                ? request.badgeLabel()
                : computeBadgeLabel(qty);

        item.setStatus(status);
        item.setBadgeLabel(badgeLabel);

        if (qty == 0) {
            item.setOnGroceryList(true);
        }

        PantryItem saved = pantryRepository.save(item);
        return toDetail(saved);
    }

    @Transactional
    public PantryResponse.GroceryToggle toggleGrocery(UUID householdId, UUID itemId, PantryRequest.ToggleGrocery request) {
        PantryItem item = pantryRepository.findByIdAndHouseholdId(itemId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Pantry item not found: " + itemId));

        item.setOnGroceryList(Boolean.TRUE.equals(request.onGroceryList()));
        pantryRepository.save(item);

        return new PantryResponse.GroceryToggle(itemId, item.isOnGroceryList());
    }

    private PantryResponse.Detail toDetail(PantryItem item) {
        return new PantryResponse.Detail(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getStatus(),
                item.getBadgeLabel(),
                item.getQuantity() != null ? item.getQuantity() : 0,
                item.getUnit(),
                item.getIconName(),
                item.isOnGroceryList()
        );
    }

    private String computeStatus(int quantity) {
        if (quantity == 0) {
            return "out";
        } else if (quantity <= 2) {
            return "low";
        } else {
            return "in_stock";
        }
    }

    private String computeBadgeLabel(int quantity) {
        if (quantity == 0) {
            return "Out";
        } else if (quantity <= 2) {
            return quantity + " left";
        } else {
            return "In Stock";
        }
    }
}

