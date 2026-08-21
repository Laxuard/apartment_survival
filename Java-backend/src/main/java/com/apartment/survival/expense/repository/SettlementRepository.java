package com.apartment.survival.expense.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.expense.model.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {

    @Query("SELECT s FROM Settlement s WHERE s.householdId = :householdId ORDER BY s.settledAt DESC, s.createdAt DESC")
    Page<Settlement> findAllByHouseholdId(@Param("householdId") UUID householdId, Pageable pageable);

    @Query("SELECT s FROM Settlement s WHERE s.householdId = :householdId AND s.settledAt >= :sinceDate")
    List<Settlement> findAllByHouseholdIdSince(@Param("householdId") UUID householdId, @Param("sinceDate") Instant sinceDate);
}
