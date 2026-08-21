package com.apartment.survival.expense.api;

import java.util.UUID;

public interface ExpensePublicApi {

    boolean hasActiveParticipation(UUID householdId, UUID userId);

    boolean hasUnsettledBalance(UUID householdId, UUID userId);
}
