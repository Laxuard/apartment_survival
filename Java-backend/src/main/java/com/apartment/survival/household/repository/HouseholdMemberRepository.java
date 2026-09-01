package com.apartment.survival.household.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.model.HouseholdRole;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, UUID> {

    // === Membership Existence Checks ===

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM HouseholdMember m " +
           "WHERE m.household.id = :householdId AND m.userId = :userId AND m.household.archived = false")
    boolean isMember(@Param("householdId") UUID householdId, @Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM HouseholdMember m " +
           "WHERE m.household.id = :householdId AND m.userId = :userId AND m.role = :role AND m.household.archived = false")
    boolean hasRole(@Param("householdId") UUID householdId, @Param("userId") UUID userId, @Param("role") HouseholdRole role);

    // === Finder Queries ===

    @Query("SELECT m FROM HouseholdMember m " +
           "WHERE m.household.id = :householdId AND m.userId = :userId AND m.household.archived = false")
    Optional<HouseholdMember> findByActiveHouseholdIdAndUserId(@Param("householdId") UUID householdId, @Param("userId") UUID userId);

    @Query("SELECT m.userId FROM HouseholdMember m " +
           "WHERE m.household.id = :householdId AND m.household.archived = false")
    java.util.Set<UUID> findActiveMemberUserIds(@Param("householdId") UUID householdId);

    @Query("SELECT COUNT(m) FROM HouseholdMember m WHERE m.household.id = :householdId")
    long countByHouseholdId(@Param("householdId") UUID householdId);

    @Query("SELECT COUNT(m) FROM HouseholdMember m WHERE m.household.id = :householdId AND m.role = :role")
    long countByHouseholdIdAndRole(@Param("householdId") UUID householdId, @Param("role") HouseholdRole role);
}
