package com.apartment.survival.household.dto;

import java.math.BigDecimal;
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
        int maxMembers,
        BigDecimal monthlyBudget,
        String wifiSsid,
        String wifiPassword,
        String splitAlgorithm,
        boolean autoRestockFromExpenses,
        HouseholdRole role,
        boolean archived,
        Instant createdAt
    ) {
        public Summary(
            UUID householdId,
            String name,
            String description,
            String avatarUrl,
            Currency currency,
            ZoneId timezone,
            int memberCount,
            boolean archived,
            Instant createdAt
        ) {
            this(householdId, name, description, avatarUrl, currency, timezone, memberCount, 10, BigDecimal.ZERO, null, null, "DEBT_SIMPLIFIED", true, null, archived, createdAt);
        }
    }

    record Detail(
        UUID householdId,
        String name,
        String description,
        String avatarUrl,
        Currency currency,
        ZoneId timezone,
        int memberCount,
        int maxMembers,
        BigDecimal monthlyBudget,
        String wifiSsid,
        String wifiPassword,
        String splitAlgorithm,
        boolean autoRestockFromExpenses,
        HouseholdRole role,
        boolean archived,
        List<MemberSummary> members,
        Instant createdAt
    ) {
        public Detail(
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
        ) {
            this(householdId, name, description, avatarUrl, currency, timezone, members != null ? members.size() : 0, maxMembers, BigDecimal.ZERO, null, null, "DEBT_SIMPLIFIED", true, null, archived, members, createdAt);
        }
    }

    record MemberSummary(
        UUID userId,
        String username,
        String email,
        HouseholdRole role,
        String nickname,
        Instant joinedAt
    ) {}
}
