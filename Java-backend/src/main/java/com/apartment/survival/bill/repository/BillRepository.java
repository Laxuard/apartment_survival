package com.apartment.survival.bill.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.survival.bill.model.Bill;

public interface BillRepository extends JpaRepository<Bill, UUID> {

    @Query("SELECT b FROM Bill b WHERE b.householdId = :householdId AND b.deleted = false ORDER BY b.isPaid ASC, b.dueDays ASC, b.createdAt DESC")
    List<Bill> findActiveByHouseholdId(@Param("householdId") UUID householdId);

    @Query("SELECT b FROM Bill b WHERE b.id = :id AND b.householdId = :householdId AND b.deleted = false")
    Optional<Bill> findByIdAndHouseholdId(@Param("id") UUID id, @Param("householdId") UUID householdId);
}
