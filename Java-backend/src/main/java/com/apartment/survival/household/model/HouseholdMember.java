package com.apartment.survival.household.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import com.apartment.survival.common.model.BaseEntity;
import com.apartment.survival.iam.model.User;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "household_members",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_household_member_user", columnNames = {"household_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_household_members_user_id", columnList = "user_id"),
        @Index(name = "idx_household_members_household_id", columnList = "household_id")
    }
)
public class HouseholdMember extends BaseEntity {

    // === Tenant & User References ===
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "household_id", 
        nullable = false, 
        foreignKey = @ForeignKey(name = "fk_household_members_household")
    )
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "user_id", 
        nullable = false, 
        foreignKey = @ForeignKey(name = "fk_household_members_user")
    )
    private User user;

    // === Membership Details ===
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HouseholdRole role = HouseholdRole.MEMBER;

    @Column(length = 50)
    private String nickname; // Optional roommate alias inside this household

    // === Domain Helper Methods ===
    public boolean isAdmin() {
        return this.role == HouseholdRole.ADMIN;
    }

    public boolean isMember() {
        return this.role == HouseholdRole.MEMBER;
    }

    public boolean isGuest() {
        return this.role == HouseholdRole.GUEST;
    }
}
