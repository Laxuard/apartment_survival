package com.apartment.survival.household.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.service.InvitationService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0")
public class UserInboxInviteController {

    private final InvitationService invitationService;

    // === 1. Join household via 8-character shareable code ===
    @PostMapping("/api/households/join")
    public ResponseEntity<HouseholdResponse.Summary> joinWithCode(@Valid @RequestBody InviteRequest.JoinWithCode request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HouseholdResponse.Summary response = invitationService.joinViaCode(request, userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    // === 2. Fetch pending invites sent to current user (/api/me/invites inbox) ===
    @GetMapping("/api/me/invites")
    public ResponseEntity<List<InviteResponse.UserInboxInvite>> getMyPendingInvites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<InviteResponse.UserInboxInvite> response = invitationService.getUserPendingInvites(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    // === 3. Accept a direct invite from inbox ===
    @PostMapping("/api/me/invites/{inviteId}/accept")
    public ResponseEntity<HouseholdResponse.Summary> acceptInvite(@PathVariable UUID inviteId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        HouseholdResponse.Summary response = invitationService.acceptDirectInvite(inviteId, userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    // === 4. Decline a direct invite from inbox ===
    @PostMapping("/api/me/invites/{inviteId}/decline")
    public ResponseEntity<Void> declineInvite(@PathVariable UUID inviteId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        invitationService.declineDirectInvite(inviteId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
