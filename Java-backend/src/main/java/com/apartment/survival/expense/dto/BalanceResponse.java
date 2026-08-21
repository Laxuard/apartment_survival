package com.apartment.survival.expense.dto;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

public interface BalanceResponse {

    record HouseholdBalances(
        UUID householdId,
        Currency currency,
        List<UserBalance> members,
        List<DebtTransfer> simplifiedDebts
    ) {}

    record UserBalance(
        UUID userId,
        String username,
        BigDecimal totalPaid,
        BigDecimal totalAssigned,
        BigDecimal totalSettledPaid,
        BigDecimal totalSettledReceived,
        BigDecimal netBalance
    ) {}

    record DebtTransfer(
        UUID fromUserId,
        String fromUsername,
        UUID toUserId,
        String toUsername,
        BigDecimal amount
    ) {}
}
