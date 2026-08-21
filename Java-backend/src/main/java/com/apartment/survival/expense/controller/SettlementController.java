package com.apartment.survival.expense.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.expense.dto.SettlementRequest;
import com.apartment.survival.expense.dto.SettlementResponse;
import com.apartment.survival.expense.service.SettlementService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    // === 1. Record a settlement payment ===
    @PostMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<SettlementResponse.Detail> create(@PathVariable UUID householdId, @Valid @RequestBody SettlementRequest.Create request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        SettlementResponse.Detail response = settlementService.create(householdId, request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // === 2. List settlement payments ===
    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<List<SettlementResponse.Detail>> getSettlements(@PathVariable UUID householdId, @PageableDefault(size = 20, sort = "settledAt", direction = Sort.Direction.DESC) Pageable pageable) {
        List<SettlementResponse.Detail> response = settlementService.getHouseholdSettlements(householdId, pageable);
        return ResponseEntity.ok(response);
    }
}
