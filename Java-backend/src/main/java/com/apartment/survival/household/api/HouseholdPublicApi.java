package com.apartment.survival.household.api;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface HouseholdPublicApi {

    boolean isMember(UUID householdId, UUID userId);

    boolean isAdmin(UUID householdId, UUID userId);

    boolean existsActive(UUID householdId);

    Optional<HouseholdPublicDto> findById(UUID householdId);

    Set<UUID> getActiveMemberUserIds(UUID householdId);

    /**
     * Returns both the household DTO and active member IDs in a single query,
     * avoiding the two-call round trip used by BalanceService.
     */
    Map.Entry<HouseholdPublicDto, Set<UUID>> findWithMemberIds(UUID householdId);
}
