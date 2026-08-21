package com.apartment.survival.household.api;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface HouseholdPublicApi {

    boolean isMember(UUID householdId, UUID userId);

    boolean existsActive(UUID householdId);

    Optional<HouseholdPublicDto> findById(UUID householdId);

    Set<UUID> getActiveMemberUserIds(UUID householdId);
}
