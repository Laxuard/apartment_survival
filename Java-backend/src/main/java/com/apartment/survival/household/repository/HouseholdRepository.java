package com.apartment.survival.household.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.household.model.Household;

public interface HouseholdRepository extends JpaRepository<Household, UUID> {

    // 1. Get household alone (for update & archive operations)
    @Query("SELECT h FROM Household h WHERE h.id = :householdId AND h.archived = false")
    Optional<Household> findActive(@Param("householdId") UUID householdId);

    // 2. Get household with all roommates (for Detail view)
    @Query("SELECT DISTINCT h FROM Household h " +
           "LEFT JOIN FETCH h.members m " +
           "WHERE h.id = :householdId AND h.archived = false")
    Optional<Household> findActiveWithMembers(@Param("householdId") UUID householdId);

    // 3. Get all active households for a user
    @Query("SELECT DISTINCT h FROM Household h " +
           "JOIN h.members m " +
           "LEFT JOIN FETCH h.members allMembers " +
           "WHERE m.userId = :userId AND h.archived = false")
    List<Household> findAllActiveByUser(@Param("userId") UUID userId);
}
