package com.apartment.survival.household.dto;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

import com.apartment.survival.household.model.HouseholdRole;

public interface HouseholdResponse {

    record Summary(
        UUID householdId,
        String name,
        String description,
        String avatarUrl,
        Currency currency,
        ZoneId timezone,
        int memberCount,
        boolean archived,
        Instant createdAt
    ) {}

    record Detail(
        UUID householdId,
        String name,
        String description,
        String avatarUrl,
        Currency currency,
        ZoneId timezone,
        int maxMembers,
        boolean archived,
        List<MemberSummary> members,
        Instant createdAt
    ) {}

    record MemberSummary(
        UUID userId,
        String username,
        String email,
        HouseholdRole role,
        String nickname,
        Instant joinedAt
    ) {}
}
