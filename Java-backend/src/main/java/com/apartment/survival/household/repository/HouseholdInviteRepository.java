package com.apartment.survival.household.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.household.model.HouseholdInvite;

public interface HouseholdInviteRepository extends JpaRepository<HouseholdInvite, UUID> {

    // 1. Find active invite by code with household hydrated (Join-via-code flow)
    @Query("SELECT i FROM HouseholdInvite i JOIN FETCH i.household h " +
           "WHERE i.code = :code AND i.status = 'PENDING' AND h.archived = false")
    Optional<HouseholdInvite> findActiveByCode(@Param("code") String code);

    // 2. Find active invite by ID with household hydrated (Accept/Decline flow)
    @Query("SELECT i FROM HouseholdInvite i JOIN FETCH i.household h " +
           "WHERE i.id = :inviteId AND h.archived = false")
    Optional<HouseholdInvite> findActiveById(@Param("inviteId") UUID inviteId);

    // 3. User's pending inbox invites (User inbox pull /api/me/invites)
    @Query("SELECT i FROM HouseholdInvite i JOIN FETCH i.household h " +
           "WHERE i.targetUserId = :userId " +
           "AND i.status = 'PENDING' " +
           "AND i.expiresAt > :now " +
           "AND h.archived = false " +
           "ORDER BY i.createdAt DESC")
    List<HouseholdInvite> findUserInbox(@Param("userId") UUID userId, @Param("now") Instant now);

    // 4. All invites belonging to a household (Admin audit list)
    @Query("SELECT i FROM HouseholdInvite i WHERE i.household.id = :householdId ORDER BY i.createdAt DESC")
    List<HouseholdInvite> findAllByHousehold(@Param("householdId") UUID householdId);

    // 5. Check if user already has an active pending invite for this household
    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM HouseholdInvite i " +
           "WHERE i.household.id = :householdId " +
           "AND i.targetUserId = :targetUserId " +
           "AND i.status = 'PENDING' " +
           "AND i.expiresAt > :now")
    boolean hasActiveInvite(@Param("householdId") UUID householdId, @Param("targetUserId") UUID targetUserId, @Param("now") Instant now);
}
