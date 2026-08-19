package com.apartment.survival.household.model;

public enum InviteStatus {
    PENDING,  // Invitation is active and awaiting acceptance
    ACCEPTED, // Invitation has been accepted by the target user
    DECLINED, // Invitation was explicitly declined by the target user
    REVOKED,  // Invitation was cancelled/revoked by a household admin
    EXPIRED   // Invitation has passed its expiresAt or reached maxUses
}
