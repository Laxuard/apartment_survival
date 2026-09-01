package com.apartment.survival.pantry.model;

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
@Table(name = "pantry_items", indexes = {
    @Index(name = "idx_pantry_household_deleted", columnList = "household_id, deleted"),
    @Index(name = "idx_pantry_household_category", columnList = "household_id, category, deleted")
})
public class PantryItem extends BaseEntity {

    @Column(name = "household_id", nullable = false, updatable = false)
    private UUID householdId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 60)
    private String category;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(length = 30)
    private String unit;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "in_stock";

    @Builder.Default
    @Column(name = "badge_label", length = 50)
    private String badgeLabel = "In Stock";

    @Builder.Default
    @Column(name = "icon_name", nullable = false, length = 30)
    private String iconName = "bread";

    @Builder.Default
    @Column(name = "on_grocery_list", nullable = false)
    private boolean onGroceryList = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;
}
