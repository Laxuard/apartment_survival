package com.apartment.survival.household.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.service.HouseholdService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    // === 1. Create a new household (Creator is automatically assigned ADMIN) ===
    @PostMapping
    public ResponseEntity<HouseholdResponse.Summary> create(@Valid @RequestBody HouseholdRequest.Create request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HouseholdResponse.Summary response = householdService.create(request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // === 2. List all active households the current user belongs to ===
    @GetMapping
    public ResponseEntity<List<HouseholdResponse.Summary>> getMyHouseholds(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<HouseholdResponse.Summary> response = householdService.getUserHouseholds(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    // === 3. Get household details with all roommates ===
    @GetMapping("/{householdId}")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<HouseholdResponse.Detail> getHousehold(@PathVariable UUID householdId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HouseholdResponse.Detail response = householdService.getHousehold(householdId,
                userDetails != null ? userDetails.getUserId() : null);
        return ResponseEntity.ok(response);
    }

    // === 3b. Get household roommates list ===
    @GetMapping("/{householdId}/members")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<List<HouseholdResponse.MemberSummary>> getMembers(@PathVariable UUID householdId) {
        List<HouseholdResponse.MemberSummary> response = householdService.getMembers(householdId);
        return ResponseEntity.ok(response);
    }

    // === 4. Update household settings (name, currency, timezone, capacity, budget,
    // wifi, etc.) ===
    @PutMapping("/{householdId}")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<HouseholdResponse.Summary> update(
            @PathVariable UUID householdId,
            @Valid @RequestBody HouseholdRequest.Update request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HouseholdResponse.Summary response = householdService.update(householdId, request,
                userDetails != null ? userDetails.getUserId() : null);
        return ResponseEntity.ok(response);
    }

    // === 5. Archive household (soft lifecycle) ===
    @DeleteMapping("/{householdId}")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<Void> archive(@PathVariable UUID householdId) {
        householdService.archive(householdId);
        return ResponseEntity.noContent().build();
    }

    // === 6. Update roommate role or nickname ===
    @PutMapping("/{householdId}/members/{targetUserId}")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<HouseholdResponse.MemberSummary> updateMember(@PathVariable UUID householdId,
            @AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID targetUserId,
            @Valid @RequestBody HouseholdRequest.UpdateMember request) {
        HouseholdResponse.MemberSummary response = householdService.updateMember(householdId, targetUserId, request);
        return ResponseEntity.ok(response);
    }

    // === 7. Remove roommate or self-leave ===
    @DeleteMapping("/{householdId}/members/{targetUserId}")
    @PreAuthorize("@householdSecurity.isSelfOrAdmin(#householdId, #targetUserId)")
    public ResponseEntity<Void> removeMember(@PathVariable UUID householdId, @PathVariable UUID targetUserId) {
        householdService.removeMember(householdId, targetUserId);
        return ResponseEntity.noContent().build();
    }
}
