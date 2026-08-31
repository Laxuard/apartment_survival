package com.apartment.survival.household.model;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.Currency;
import java.util.HashSet;
import java.util.Set;

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
@Table(name = "households", indexes = {
    @Index(name = "idx_households_name", columnList = "name")
})
public class Household extends BaseEntity {

    // === Core Profile ===
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    // === Localization & Settings ===
    @Builder.Default
    @Column(nullable = false, length = 3)
    private Currency currency = Currency.getInstance("MAD");

    @Builder.Default
    @Column(nullable = false, length = 50)
    private ZoneId timezone = ZoneId.of("Africa/Casablanca"); // Required for local chore rotations and alerts

    @Builder.Default
    @Column(name = "max_members", nullable = false)
    private int maxMembers = 10;

    @Builder.Default
    @Column(name = "monthly_budget", precision = 12, scale = 2)
    private BigDecimal monthlyBudget = BigDecimal.ZERO;

    @Column(name = "wifi_ssid", length = 100)
    private String wifiSsid;

    @Column(name = "wifi_password", length = 100)
    private String wifiPassword;

    @Builder.Default
    @Column(name = "split_algorithm", length = 30, nullable = false)
    private String splitAlgorithm = "DEBT_SIMPLIFIED";

    @Builder.Default
    @Column(name = "auto_restock_from_expenses", nullable = false)
    private boolean autoRestockFromExpenses = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean archived = false;

    // === Relationships ===
    @Builder.Default
    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HouseholdMember> members = new HashSet<>();

    // === Relationship Helpers ===
    public void addMember(HouseholdMember member) {
        members.add(member);
        member.setHousehold(this);
    }

    public void removeMember(HouseholdMember member) {
        members.remove(member);
        member.setHousehold(null);
    }
}
