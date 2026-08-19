package com.apartment.survival.household.model;

import java.time.Instant;
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
    name = "household_invites",
    indexes = {
        @Index(name = "idx_household_invites_code", columnList = "code"),
        @Index(name = "idx_household_invites_target_user", columnList = "target_user_id"),
        @Index(name = "idx_household_invites_household_status", columnList = "household_id, status")
    }
)
public class HouseholdInvite extends BaseEntity {

    // === Tenant & Creator Reference ===
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "household_id", 
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_household_invites_household")
    )
    private Household household;

    @Column(name = "created_by_user_id", nullable = false, updatable = false)
    private UUID createdByUserId;

    // === Invitation Type & State ===
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InviteType type;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InviteStatus status = InviteStatus.PENDING;

    // === Target Recipients (Type Dependent) ===
    @Column(name = "target_user_id")
    private UUID targetUserId; // Populated for DIRECT_USER invites

    @Column(name = "target_email", length = 255)
    private String targetEmail; // Populated for EMAIL invites

    // === Token & Capacity ===
    @Column(length = 32, unique = true)
    private String code; // Populated for LINK and EMAIL tokens

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "max_uses")
    private Integer maxUses; // Nullable: null represents unlimited uses (for shareable links)

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private int usedCount = 0;

    // === Domain Helper Methods ===

    public boolean isValid() {
        if (this.status != InviteStatus.PENDING) {
            return false;
        }
        if (Instant.now().isAfter(this.expiresAt)) {
            return false;
        }
        if (this.maxUses != null && this.usedCount >= this.maxUses) {
            return false;
        }
        return true;
    }

    public void incrementUsage() {
        this.usedCount++;
        if (this.maxUses != null && this.usedCount >= this.maxUses) {
            this.status = (this.type == InviteType.DIRECT_USER) ? InviteStatus.ACCEPTED : InviteStatus.EXPIRED;
        }
    }
}
