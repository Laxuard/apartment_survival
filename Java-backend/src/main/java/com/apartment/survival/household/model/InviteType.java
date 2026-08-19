package com.apartment.survival.household.model;

public enum InviteType {
    LINK,        // Shareable base-32 join code
    DIRECT_USER, // Internal registered user invited by username
    EMAIL        // External email invite (ready for future email flows)
}
