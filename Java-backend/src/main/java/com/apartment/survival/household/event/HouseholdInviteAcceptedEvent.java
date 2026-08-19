package com.apartment.survival.household.event;

import java.util.UUID;

/**
 * Published when a user accepts a direct invite or joins via a shareable code.
 * Listeners can use this to send confirmation notifications without knowing the join logic.
 */
public record HouseholdInviteAcceptedEvent(
    UUID inviteId,
    UUID householdId,
    UUID acceptedByUserId
) {}
