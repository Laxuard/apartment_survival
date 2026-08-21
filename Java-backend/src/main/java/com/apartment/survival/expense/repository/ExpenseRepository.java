package com.apartment.survival.expense.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.expense.model.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

       @Query("SELECT e FROM Expense e WHERE e.id = :id AND e.householdId = :householdId AND e.deleted = false")
       Optional<Expense> findActiveByIdAndHouseholdId(@Param("id") UUID id, @Param("householdId") UUID householdId);

       @Query("SELECT DISTINCT e FROM Expense e " +
                     "LEFT JOIN FETCH e.splits s " +
                     "WHERE e.id = :id AND e.householdId = :householdId AND e.deleted = false")
       Optional<Expense> findActiveByIdAndHouseholdIdWithSplits(@Param("id") UUID id,@Param("householdId") UUID householdId);

       @Query(value = "SELECT e FROM Expense e WHERE e.householdId = :householdId AND e.deleted = false " +
                     "ORDER BY e.expenseDate DESC, e.createdAt DESC", countQuery = "SELECT COUNT(e) FROM Expense e WHERE e.householdId = :householdId AND e.deleted = false")
       Page<Expense> findAllActiveByHouseholdId(@Param("householdId") UUID householdId, Pageable pageable);

       @Query("SELECT DISTINCT e FROM Expense e " +
                     "LEFT JOIN FETCH e.splits s " +
                     "WHERE e.householdId = :householdId AND e.deleted = false AND e.expenseDate >= :sinceDate")
       List<Expense> findAllActiveWithSplitsByHouseholdIdSince(@Param("householdId") UUID householdId, @Param("sinceDate") Instant sinceDate);

       @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Expense e " +
                     "WHERE e.householdId = :householdId AND e.deleted = false AND " +
                     "(e.paidByUserId = :userId OR EXISTS (SELECT 1 FROM ExpenseSplit s WHERE s.expense = e AND s.userId = :userId))")
       boolean existsActiveParticipation(@Param("householdId") UUID householdId, @Param("userId") UUID userId);

       /**
        * Computes the net balance contribution of a single user in a single SQL query.
        * net = totalPaid - totalAssigned + settledPaid - settledReceived
        * Used by hasUnsettledBalance to avoid running the full Min-Cash-Flow
        * algorithm.
        */
       @Query(value = """
                     SELECT
                       COALESCE((SELECT SUM(e2.amount) FROM expenses e2
                                 WHERE e2.household_id = :householdId AND e2.paid_by_user_id = :userId AND e2.deleted = false), 0)
                       -
                       COALESCE((SELECT SUM(es.assigned_amount) FROM expense_splits es
                                 JOIN expenses e3 ON es.expense_id = e3.id
                                 WHERE e3.household_id = :householdId AND es.user_id = :userId AND e3.deleted = false), 0)
                       +
                       COALESCE((SELECT SUM(s2.amount) FROM settlements s2
                                 WHERE s2.household_id = :householdId AND s2.payer_user_id = :userId), 0)
                       -
                       COALESCE((SELECT SUM(s3.amount) FROM settlements s3
                                 WHERE s3.household_id = :householdId AND s3.recipient_user_id = :userId), 0)
                     """, nativeQuery = true)
       BigDecimal computeNetBalance(@Param("householdId") UUID householdId, @Param("userId") UUID userId);
}
