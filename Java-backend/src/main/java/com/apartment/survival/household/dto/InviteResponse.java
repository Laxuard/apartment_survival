package com.apartment.survival.household.dto;

import java.time.Instant;
import java.util.UUID;

import com.apartment.survival.household.model.InviteStatus;
import com.apartment.survival.household.model.InviteType;

public interface InviteResponse {

    // === 1. Household Admin View (All invites for management) ===
    record HouseholdInviteSummary(
        UUID inviteId,
        InviteType type,
        InviteStatus status,
        String code,           // Populated for LINK invites
        String targetUsername, // Populated for DIRECT_USER invites
        Integer maxUses,
        int usedCount,
        Instant expiresAt,
        Instant createdAt
    ) {}

    // === 2. User Inbox View (/api/me/invites pull endpoint) ===
    record UserInboxInvite(
        UUID inviteId,
        UUID householdId,
        String householdName,
        String householdDescription,
        String invitedByUsername,
        Instant expiresAt,
        Instant createdAt
    ) {}
}
