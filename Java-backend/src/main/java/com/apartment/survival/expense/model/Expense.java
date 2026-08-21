package com.apartment.survival.expense.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.*;

import com.apartment.survival.common.model.BaseEntity;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expenses_household_date", columnList = "household_id, expense_date"),
        @Index(name = "idx_expenses_payer", columnList = "paid_by_user_id"),
        @Index(name = "idx_expenses_category", columnList = "category")
})
public class Expense extends BaseEntity {

    // === Tenant & Payer Reference (DDD Decoupled) ===
    @Column(name = "household_id", nullable = false, updatable = false)
    private UUID householdId;

    @Column(name = "paid_by_user_id", nullable = false)
    private UUID paidByUserId;

    // === Expense Profile ===
    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_type", nullable = false, length = 20)
    private SplitType splitType;

    // === Temporal & Audit Metadata ===
    @Builder.Default
    @Column(name = "expense_date", nullable = false)
    private Instant expenseDate = Instant.now();

    @Column(name = "receipt_url", length = 512)
    private String receiptUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;

    // === Relationships ===
    @Builder.Default
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ExpenseSplit> splits = new HashSet<>();

    // === Relationship Helpers ===
    public void addSplit(ExpenseSplit split) {
        splits.add(split);
        split.setExpense(this);
    }

    public void removeSplit(ExpenseSplit split) {
        splits.remove(split);
        split.setExpense(null);
    }

    public void clearSplits() {
        for (ExpenseSplit split : new HashSet<>(splits)) {
            removeSplit(split);
        }
    }
}
