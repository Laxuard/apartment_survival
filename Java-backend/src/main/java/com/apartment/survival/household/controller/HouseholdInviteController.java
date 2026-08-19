package com.apartment.survival.household.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.service.InvitationService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/invites")
public class HouseholdInviteController {

    private final InvitationService invitationService;

    // === 1. Generate shareable join link/code (Admins only) ===
    @PostMapping("/link")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<InviteResponse.HouseholdInviteSummary> createLinkInvite(@PathVariable UUID householdId, @Valid @RequestBody(required = false) InviteRequest.CreateLink request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        InviteResponse.HouseholdInviteSummary response = invitationService.createLinkInvite(householdId, request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // === 2. Send direct invite to registered username (Admins only) ===
    @PostMapping("/direct")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<InviteResponse.HouseholdInviteSummary> createDirectInvite(@PathVariable UUID householdId, @Valid @RequestBody InviteRequest.CreateDirect request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        InviteResponse.HouseholdInviteSummary response = invitationService.createDirectInvite(householdId, request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // === 3. List all household invites (Admins audit) ===
    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<List<InviteResponse.HouseholdInviteSummary>> getHouseholdInvites(@PathVariable UUID householdId) {
        List<InviteResponse.HouseholdInviteSummary> response = invitationService.getHouseholdInvites(householdId);
        return ResponseEntity.ok(response);
    }

    // === 4. Revoke an active invite (Admins only) ===
    @DeleteMapping("/{inviteId}")
    @PreAuthorize("@householdSecurity.isHouseholdAdmin(#householdId)")
    public ResponseEntity<Void> revokeInvite(@PathVariable UUID householdId, @PathVariable UUID inviteId) {
        invitationService.revokeInvite(householdId, inviteId);
        return ResponseEntity.noContent().build();
    }
}
