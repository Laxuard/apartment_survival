package com.apartment.survival.expense.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.survival.expense.dto.BalanceResponse;
import com.apartment.survival.expense.service.BalanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/balances")
public class BalanceController {

    private final BalanceService balanceService;

    // === 1. Get household balance summary and simplified debt transfers ===
    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<BalanceResponse.HouseholdBalances> getBalances(@PathVariable UUID householdId) {
        BalanceResponse.HouseholdBalances response = balanceService.getHouseholdBalances(householdId);
        return ResponseEntity.ok(response);
    }
}
