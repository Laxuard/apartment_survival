package com.apartment.survival.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

import com.apartment.survival.expense.model.ExpenseCategory;
import com.apartment.survival.expense.model.SplitType;

public interface ExpenseResponse {

    record Summary(
        UUID expenseId,
        UUID householdId,
        UUID paidByUserId,
        String paidByUsername,
        String title,
        BigDecimal amount,
        Currency currency,
        ExpenseCategory category,
        SplitType splitType,
        Instant expenseDate,
        String receiptUrl,
        int participantCount,
        Instant createdAt
    ) {}

    record Detail(
        UUID expenseId,
        UUID householdId,
        UUID paidByUserId,
        String paidByUsername,
        String title,
        String description,
        BigDecimal amount,
        Currency currency,
        ExpenseCategory category,
        SplitType splitType,
        Instant expenseDate,
        String receiptUrl,
        List<SplitDetail> splits,
        Instant createdAt,
        Instant updatedAt
    ) {}

    record SplitDetail(
        UUID splitId,
        UUID userId,
        String username,
        BigDecimal assignedAmount,
        BigDecimal splitValue
    ) {}
}
