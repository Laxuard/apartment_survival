package com.apartment.survival.expense.model;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import com.apartment.survival.common.model.BaseEntity;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "expense_splits",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_expense_split_user", columnNames = {"expense_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_expense_splits_user", columnList = "user_id"),
        @Index(name = "idx_expense_splits_expense", columnList = "expense_id")
    }
)
public class ExpenseSplit extends BaseEntity {

    // === Parent Expense Reference ===
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "expense_id", 
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_expense_splits_expense")
    )
    private Expense expense;

    // === Participant User Reference (DDD Decoupled) ===
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // === Financial Allocation ===
    @Column(name = "assigned_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal assignedAmount;

    // Optional split metadata for percentage / ratio auditing
    @Column(name = "split_value", precision = 8, scale = 4)
    private BigDecimal splitValue;
}
