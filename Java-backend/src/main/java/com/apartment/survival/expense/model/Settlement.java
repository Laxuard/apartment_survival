package com.apartment.survival.expense.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
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
    name = "settlements",
    indexes = {
        @Index(name = "idx_settlements_household_date", columnList = "household_id, settled_at"),
        @Index(name = "idx_settlements_household_payer", columnList = "household_id, payer_user_id"),
        @Index(name = "idx_settlements_household_recipient", columnList = "household_id, recipient_user_id")
    }
)
public class Settlement extends BaseEntity {

    // === Tenant Context (DDD Decoupled) ===
    @Column(name = "household_id", nullable = false, updatable = false)
    private UUID householdId;

    // === Peer-to-Peer Counterparties ===
    @Column(name = "payer_user_id", nullable = false, updatable = false)
    private UUID payerUserId;

    @Column(name = "recipient_user_id", nullable = false, updatable = false)
    private UUID recipientUserId;

    // === Monetary & Audit Details ===
    @Column(nullable = false, precision = 12, scale = 2, updatable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3, updatable = false)
    private Currency currency;

    @Builder.Default
    @Column(name = "settled_at", nullable = false)
    private Instant settledAt = Instant.now();

    @Column(length = 255)
    private String notes;
}
