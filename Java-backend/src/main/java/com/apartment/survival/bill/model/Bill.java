package com.apartment.survival.bill.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import com.apartment.survival.common.model.BaseEntity;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "bills", indexes = {
    @Index(name = "idx_bills_household_deleted", columnList = "household_id, deleted"),
    @Index(name = "idx_bills_household_due", columnList = "household_id, due_days, deleted")
})
public class Bill extends BaseEntity {

    @Column(name = "household_id", nullable = false, updatable = false)
    private UUID householdId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "MAD";

    @Builder.Default
    @Column(name = "due_days", nullable = false)
    private Integer dueDays = 7;

    @Column(name = "due_text", length = 100)
    private String dueText;

    @Builder.Default
    @Column(name = "auto_split", nullable = false)
    private boolean autoSplit = false;

    @Builder.Default
    @Column(name = "icon_name", nullable = false, length = 30)
    private String iconName = "home";

    @Builder.Default
    @Column(name = "is_paid", nullable = false)
    private boolean isPaid = false;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "paid_by_user_id")
    private UUID paidByUserId;

    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;
}
