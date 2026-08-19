package com.apartment.survival.household.event;

import java.time.Instant;
import java.util.UUID;

import com.apartment.survival.household.model.InviteType;

/**
 * Published when any invite (LINK or DIRECT_USER) is created by a household admin.
 * Listeners (e.g. a future notification module) can subscribe without touching household logic.
 */
public record HouseholdInviteCreatedEvent(
    UUID inviteId,
    UUID householdId,
    String householdName,
    UUID createdByUserId,
    InviteType type,
    UUID targetUserId,   // Populated for DIRECT_USER invites
    String targetEmail,  // Populated for EMAIL invites
    String inviteCode,   // Populated for LINK/EMAIL token invites
    Instant expiresAt
) {}
