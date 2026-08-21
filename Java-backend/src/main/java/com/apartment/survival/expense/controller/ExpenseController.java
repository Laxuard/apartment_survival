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

import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.dto.ExpenseResponse;
import com.apartment.survival.expense.service.ExpenseService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    // === 1. Create a new expense ===
    @PostMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<ExpenseResponse.Detail> create(@PathVariable UUID householdId, @Valid @RequestBody ExpenseRequest.Create request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ExpenseResponse.Detail response = expenseService.create(householdId, request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // === 2. List active expenses for the household ===
    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<List<ExpenseResponse.Summary>> getExpenses(@PathVariable UUID householdId, @PageableDefault(size = 20, sort = "expenseDate", direction = Sort.Direction.DESC) Pageable pageable) {
        List<ExpenseResponse.Summary> response = expenseService.getHouseholdExpenses(householdId, pageable);
        return ResponseEntity.ok(response);
    }

    // === 3. Get detailed expense with splits ===
    @GetMapping("/{expenseId}")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<ExpenseResponse.Detail> getExpense(@PathVariable UUID householdId, @PathVariable UUID expenseId) {
        ExpenseResponse.Detail response = expenseService.getExpense(householdId, expenseId);
        return ResponseEntity.ok(response);
    }

    // === 4. Update expense ===
    @PutMapping("/{expenseId}")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<ExpenseResponse.Detail> update(@PathVariable UUID householdId, @PathVariable UUID expenseId, @Valid @RequestBody ExpenseRequest.Update request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ExpenseResponse.Detail response = expenseService.update(householdId, expenseId, request, userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    // === 5. Soft-delete expense ===
    @DeleteMapping("/{expenseId}")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<Void> delete(@PathVariable UUID householdId, @PathVariable UUID expenseId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        expenseService.delete(householdId, expenseId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
