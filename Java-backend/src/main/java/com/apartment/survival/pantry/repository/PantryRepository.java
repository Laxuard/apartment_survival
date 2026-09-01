package com.apartment.survival.pantry.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.pantry.model.PantryItem;

public interface PantryRepository extends JpaRepository<PantryItem, UUID> {

    @Query("SELECT p FROM PantryItem p WHERE p.householdId = :householdId AND p.deleted = false ORDER BY p.category ASC, p.name ASC")
    List<PantryItem> findActiveByHouseholdId(@Param("householdId") UUID householdId);

    @Query("SELECT p FROM PantryItem p WHERE p.id = :id AND p.householdId = :householdId AND p.deleted = false")
    Optional<PantryItem> findByIdAndHouseholdId(@Param("id") UUID id, @Param("householdId") UUID householdId);
}
