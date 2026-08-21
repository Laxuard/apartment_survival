package com.apartment.survival.expense.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.model.SplitType;

@Component
public class SplitCalculator {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");
    private static final BigDecimal HUNDRED_INT = new BigDecimal("100");
    private static final BigDecimal ONE_CENT = new BigDecimal("0.01");

    public record CalculatedSplit(
        UUID userId,
        BigDecimal assignedAmount,
        BigDecimal splitValue
    ) {}

    public List<CalculatedSplit> calculate(BigDecimal totalAmount, SplitType splitType, List<ExpenseRequest.SplitItem> items) {

        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Expense total amount must be strictly greater than zero.");
        }
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("At least one participant is required for expense splitting.");
        }

        // Validate unique participants
        Set<UUID> seenUserIds = new HashSet<>();
        for (ExpenseRequest.SplitItem item : items) {
            if (item.userId() == null) {
                throw new BadRequestException("Participant user ID cannot be null.");
            }
            if (!seenUserIds.add(item.userId())) {
                throw new BadRequestException("Duplicate participant found in split: " + item.userId());
            }
        }

        BigDecimal scaledTotal = totalAmount.setScale(2, RoundingMode.HALF_EVEN);

        // Guard against zero-cent splits (total must allow at least 0.01 per participant)
        if (scaledTotal.compareTo(BigDecimal.valueOf(items.size()).multiply(ONE_CENT)) < 0) {
            throw new BadRequestException("Expense amount is too small to divide among " + items.size() + " participants.");
        }

        return switch (splitType) {
            case EQUAL -> calculateEqual(scaledTotal, items);
            case EXACT -> calculateExact(scaledTotal, items);
            case PERCENTAGE -> calculatePercentage(scaledTotal, items);
            case SHARES -> calculateShares(scaledTotal, items);
        };
    }

    // 1. EQUAL: Distributes 1-cent remainders across the first N participants
    private List<CalculatedSplit> calculateEqual(BigDecimal totalAmount, List<ExpenseRequest.SplitItem> items) {
        int count = items.size();
        BigDecimal countDec = BigDecimal.valueOf(count);
        BigDecimal baseAmount = totalAmount.divide(countDec, 2, RoundingMode.FLOOR);
        BigDecimal remainder = totalAmount.subtract(baseAmount.multiply(countDec));
        int remainderCents = remainder.movePointRight(2).intValueExact();

        List<CalculatedSplit> results = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            BigDecimal assigned = baseAmount;
            if (i < remainderCents) {
                assigned = assigned.add(ONE_CENT);
            }
            results.add(new CalculatedSplit(items.get(i).userId(), assigned, null));
        }
        return results;
    }

    // 2. EXACT: Enforces strict mathematical match with total expense amount
    private List<CalculatedSplit> calculateExact(BigDecimal totalAmount, List<ExpenseRequest.SplitItem> items) {
        BigDecimal runningTotal = BigDecimal.ZERO;
        List<CalculatedSplit> results = new ArrayList<>(items.size());

        for (ExpenseRequest.SplitItem item : items) {
            if (item.amount() == null || item.amount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Exact amount must be greater than zero for user: " + item.userId());
            }
            BigDecimal scaled = item.amount().setScale(2, RoundingMode.HALF_EVEN);
            runningTotal = runningTotal.add(scaled);
            results.add(new CalculatedSplit(item.userId(), scaled, null));
        }

        if (runningTotal.compareTo(totalAmount) != 0) {
            throw new BadRequestException(
                String.format("Exact splits sum (%s) does not match total expense amount (%s).", runningTotal, totalAmount));
        }
        return results;
    }

    // 3. PERCENTAGE: Validates exact 100% and fairly allocates penny remainders
    private List<CalculatedSplit> calculatePercentage(BigDecimal totalAmount, List<ExpenseRequest.SplitItem> items) {
        BigDecimal totalPercentage = BigDecimal.ZERO;
        BigDecimal allocatedTotal = BigDecimal.ZERO;
        List<CalculatedSplit> rawSplits = new ArrayList<>(items.size());

        // Single pass: validate + accumulate + compute allocations
        for (ExpenseRequest.SplitItem item : items) {
            if (item.percentage() == null || item.percentage().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Percentage must be greater than zero for user: " + item.userId());
            }
            totalPercentage = totalPercentage.add(item.percentage());
            BigDecimal share = totalAmount.multiply(item.percentage()).divide(HUNDRED, 2, RoundingMode.FLOOR);
            allocatedTotal = allocatedTotal.add(share);
            rawSplits.add(new CalculatedSplit(item.userId(), share, item.percentage()));
        }

        // Strict 100.00% validation without rounding shortcuts
        if (totalPercentage.compareTo(HUNDRED) != 0 && totalPercentage.compareTo(HUNDRED_INT) != 0) {
            throw new BadRequestException("Percentages must sum to exactly 100%. Current sum: " + totalPercentage + "%");
        }

        return distributeRemainderCents(totalAmount, allocatedTotal, rawSplits);
    }

    // 4. SHARES: Proportional allocation with penny distribution
    private List<CalculatedSplit> calculateShares(BigDecimal totalAmount, List<ExpenseRequest.SplitItem> items) {
        BigDecimal totalShares = BigDecimal.ZERO;
        BigDecimal allocatedTotal = BigDecimal.ZERO;
        List<CalculatedSplit> rawSplits = new ArrayList<>(items.size());

        // Single pass: validate + sum + compute preliminary allocations
        // Note: share amounts depend on totalShares, so we must complete the validation pass
        // before we can divide. We accumulate shares here then do a second allocation step.
        for (ExpenseRequest.SplitItem item : items) {
            if (item.shares() == null || item.shares().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Shares must be greater than zero for user: " + item.userId());
            }
            totalShares = totalShares.add(item.shares());
        }

        for (ExpenseRequest.SplitItem item : items) {
            BigDecimal shareAmount = totalAmount.multiply(item.shares()).divide(totalShares, 2, RoundingMode.FLOOR);
            allocatedTotal = allocatedTotal.add(shareAmount);
            rawSplits.add(new CalculatedSplit(item.userId(), shareAmount, item.shares()));
        }

        return distributeRemainderCents(totalAmount, allocatedTotal, rawSplits);
    }

    private List<CalculatedSplit> distributeRemainderCents(BigDecimal totalAmount, BigDecimal allocatedTotal, List<CalculatedSplit> splits) {

        BigDecimal remainder = totalAmount.subtract(allocatedTotal);
        int remainderCents = remainder.movePointRight(2).intValueExact();

        List<CalculatedSplit> finalSplits = new ArrayList<>(splits.size());
        for (int i = 0; i < splits.size(); i++) {
            CalculatedSplit split = splits.get(i);
            BigDecimal adjustedAmount = split.assignedAmount();
            if (i < remainderCents) {
                adjustedAmount = adjustedAmount.add(ONE_CENT);
            }

            finalSplits.add(new CalculatedSplit(split.userId(), adjustedAmount, split.splitValue()));
        }
        return finalSplits;
    }
}
