package com.apartment.survival.expense.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.expense.api.ExpensePublicApi;
import com.apartment.survival.expense.repository.ExpenseRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpensePublicApiImpl implements ExpensePublicApi {

    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveParticipation(UUID householdId, UUID userId) {
        return expenseRepository.existsActiveParticipation(householdId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUnsettledBalance(UUID householdId, UUID userId) {
        try {
            java.math.BigDecimal net = expenseRepository.computeNetBalance(householdId, userId);
            return net != null && net.compareTo(java.math.BigDecimal.ZERO) != 0;
        } catch (Exception e) {
            log.error("Failed to compute net balance for user [{}] in household [{}]: {}",
                    userId, householdId, e.getMessage(), e);
            return false;
        }
    }
}
