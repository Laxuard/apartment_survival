package com.apartment.survival.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
import java.util.UUID;

public interface SettlementResponse {

    record Detail(
        UUID settlementId,
        UUID householdId,
        UUID payerUserId,
        String payerUsername,
        UUID recipientUserId,
        String recipientUsername,
        BigDecimal amount,
        Currency currency,
        Instant settledAt,
        String notes,
        Instant createdAt
    ) {}
}
