package com.apartment.survival.expense.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.expense.dto.BalanceResponse;
import com.apartment.survival.expense.model.Expense;
import com.apartment.survival.expense.model.ExpenseSplit;
import com.apartment.survival.expense.model.Settlement;
import com.apartment.survival.expense.repository.ExpenseRepository;
import com.apartment.survival.expense.repository.SettlementRepository;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BalanceService {

    /**
     * Rolling window for balance calculation. Expenses and settlements older than
     * this are excluded from the live ledger. Increase as needed; the tradeoff is
     * memory/CPU vs. historical completeness. For most households 24 months covers
     * the full active lifetime of the tenancy.
     */
    static final long BALANCE_WINDOW_MONTHS = 24;

    private final HouseholdPublicApi householdPublicApi;
    private final UserPublicApi userPublicApi;
    private final BalanceCalculator balanceCalculator;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    @Transactional(readOnly = true)
    public BalanceResponse.HouseholdBalances getHouseholdBalances(UUID householdId) {
        // Fix 3: single cross-module call instead of two
        Map.Entry<HouseholdPublicDto, Set<UUID>> householdEntry =
                householdPublicApi.findWithMemberIds(householdId);
        HouseholdPublicDto household = householdEntry.getKey();
        Set<UUID> memberUserIds = householdEntry.getValue();

        // Fix 2: date-bounded queries — only load the rolling window into memory
        Instant sinceDate = Instant.now().minus(BALANCE_WINDOW_MONTHS * 30, ChronoUnit.DAYS);
        List<Expense> expenses = expenseRepository.findAllActiveWithSplitsByHouseholdIdSince(householdId, sinceDate);
        List<Settlement> settlements = settlementRepository.findAllByHouseholdIdSince(householdId, sinceDate);

        // Gather all user IDs that need username resolution
        Set<UUID> allUserIds = new java.util.HashSet<>(memberUserIds);
        for (Expense expense : expenses) {
            allUserIds.add(expense.getPaidByUserId());
            for (ExpenseSplit split : expense.getSplits()) {
                allUserIds.add(split.getUserId());
            }
        }
        for (Settlement settlement : settlements) {
            allUserIds.add(settlement.getPayerUserId());
            allUserIds.add(settlement.getRecipientUserId());
        }

        Map<UUID, UserPublicDto> profiles = userPublicApi.findAllByIds(allUserIds);
        Map<UUID, String> usernames = new HashMap<>();
        for (Map.Entry<UUID, UserPublicDto> entry : profiles.entrySet()) {
            usernames.put(entry.getKey(), entry.getValue().username());
        }

        return balanceCalculator.calculateBalances(
                householdId,
                household.currency(),
                household.splitAlgorithm(),
                memberUserIds,
                expenses,
                settlements,
                usernames
        );
    }
}
