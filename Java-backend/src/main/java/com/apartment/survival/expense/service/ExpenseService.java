package com.apartment.survival.expense.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.dto.ExpenseResponse;
import com.apartment.survival.expense.mapper.ExpenseMapper;
import com.apartment.survival.expense.model.Expense;
import com.apartment.survival.expense.model.ExpenseSplit;
import com.apartment.survival.expense.repository.ExpenseRepository;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final HouseholdPublicApi householdPublicApi;
    private final UserPublicApi userPublicApi;
    private final SplitCalculator splitCalculator;
    private final ExpenseMapper expenseMapper;
    private final ExpenseRepository expenseRepository;

    // === 1. Create Expense ===
    @Transactional
    public ExpenseResponse.Detail create(UUID householdId, ExpenseRequest.Create request, UUID paidByUserId) {
        HouseholdPublicDto household = householdPublicApi.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        // Fetch member set once and reuse for both payer and participant validation
        Set<UUID> activeMemberIds = householdPublicApi.getActiveMemberUserIds(householdId);
        if (!activeMemberIds.contains(paidByUserId)) {
            throw new BadRequestException("Payer is not an active member of this household.");
        }
        for (ExpenseRequest.SplitItem splitItem : request.splits()) {
            if (!activeMemberIds.contains(splitItem.userId())) {
                throw new BadRequestException("Participant " + splitItem.userId() + " is not an active member of this household.");
            }
        }

        // 1. Calculate financial allocations
        List<SplitCalculator.CalculatedSplit> calculatedSplits =
                splitCalculator.calculate(request.amount(), request.splitType(), request.splits());

        // 2. Build and populate Expense entity
        Expense expense = expenseMapper.toEntity(request);
        expense.setHouseholdId(householdId);
        expense.setPaidByUserId(paidByUserId);
        expense.setCurrency(household.currency());

        for (SplitCalculator.CalculatedSplit calculated : calculatedSplits) {
            ExpenseSplit split = ExpenseSplit.builder()
                    .userId(calculated.userId())
                    .assignedAmount(calculated.assignedAmount())
                    .splitValue(calculated.splitValue())
                    .build();
            expense.addSplit(split);
        }

        Expense saved = expenseRepository.save(expense);
        return toExpenseDetail(saved);
    }

    // === 2. Get Expense Detail ===
    @Transactional(readOnly = true)
    public ExpenseResponse.Detail getExpense(UUID householdId, UUID expenseId) {
        Expense expense = expenseRepository.findActiveByIdAndHouseholdIdWithSplits(expenseId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + expenseId));

        return toExpenseDetail(expense);
    }

    // === 3. List Active Household Expenses ===
    @Transactional(readOnly = true)
    public List<ExpenseResponse.Summary> getHouseholdExpenses(UUID householdId, Pageable pageable) {
        Page<Expense> expensePage = expenseRepository.findAllActiveByHouseholdId(householdId, pageable);

        Set<UUID> payerIds = new HashSet<>();
        expensePage.getContent().forEach(e -> payerIds.add(e.getPaidByUserId()));

        Map<UUID, UserPublicDto> profiles = userPublicApi.findAllByIds(payerIds);

        return expensePage.getContent().stream()
                .map(e -> expenseMapper.toSummary(e, getUsernameOrDefault(profiles, e.getPaidByUserId())))
                .toList();
    }

    // === 4. Update Expense ===
    @Transactional
    public ExpenseResponse.Detail update(UUID householdId, UUID expenseId, ExpenseRequest.Update request, UUID currentUserId) {
        Expense expense = expenseRepository.findActiveByIdAndHouseholdIdWithSplits(expenseId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + expenseId));

        boolean isAdmin = householdPublicApi.isAdmin(householdId, currentUserId);
        if (!expense.getPaidByUserId().equals(currentUserId) && !isAdmin) {
            throw new BadRequestException("Only the expense creator or a household admin can update this expense.");
        }

        expenseMapper.updateEntity(request, expense);
        return toExpenseDetail(expense);
    }

    // === 5. Soft-Delete Expense ===
    @Transactional
    public void delete(UUID householdId, UUID expenseId, UUID currentUserId) {
        Expense expense = expenseRepository.findActiveByIdAndHouseholdId(expenseId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + expenseId));

        boolean isAdmin = householdPublicApi.isAdmin(householdId, currentUserId);
        if (!expense.getPaidByUserId().equals(currentUserId) && !isAdmin) {
            throw new BadRequestException("Only the expense creator or a household admin can delete this expense.");
        }

        expense.setDeleted(true);
    }

    private ExpenseResponse.Detail toExpenseDetail(Expense expense) {
        Set<UUID> userIdsToResolve = new HashSet<>();
        expense.getSplits().forEach(s -> userIdsToResolve.add(s.getUserId()));
        userIdsToResolve.add(expense.getPaidByUserId());

        Map<UUID, UserPublicDto> profiles = userPublicApi.findAllByIds(userIdsToResolve);
        String payerUsername = getUsernameOrDefault(profiles, expense.getPaidByUserId());

        List<ExpenseResponse.SplitDetail> splitDetails = expense.getSplits().stream()
                .map(s -> expenseMapper.toSplitDetail(s, getUsernameOrDefault(profiles, s.getUserId())))
                .toList();

        return expenseMapper.toDetail(expense, payerUsername, splitDetails);
    }

    private String getUsernameOrDefault(Map<UUID, UserPublicDto> profiles, UUID userId) {
        UserPublicDto dto = profiles.get(userId);
        return dto != null ? dto.username() : "Unknown User";
    }
}
