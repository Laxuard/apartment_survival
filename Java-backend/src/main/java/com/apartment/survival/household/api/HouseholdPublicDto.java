package com.apartment.survival.household.api;

import java.time.ZoneId;
import java.util.Currency;
import java.util.UUID;

public record HouseholdPublicDto(
    UUID id,
    String name,
    Currency currency,
    ZoneId timezone,
    boolean archived,
    int maxMembers,
    String splitAlgorithm,
    String defaultSplitMethod,
    String defaultSplitAllocations
) {}
