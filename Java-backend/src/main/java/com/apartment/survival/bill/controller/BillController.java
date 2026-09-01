package com.apartment.survival.bill.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.apartment.survival.bill.dto.BillRequest;
import com.apartment.survival.bill.dto.BillResponse;
import com.apartment.survival.bill.service.BillService;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(version = "1.0", path = "/api/households/{householdId}/bills")
public class BillController {

    private final BillService billService;

    @GetMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<List<BillResponse.Detail>> getBills(@PathVariable UUID householdId) {
        List<BillResponse.Detail> response = billService.getBills(householdId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<BillResponse.Detail> createBill(
            @PathVariable UUID householdId,
            @Valid @RequestBody BillRequest.Create request) {
        BillResponse.Detail response = billService.createBill(householdId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{billId}/pay")
    @PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")
    public ResponseEntity<BillResponse.PayResponse> payBill(
            @PathVariable UUID householdId,
            @PathVariable UUID billId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        BillResponse.PayResponse response = billService.payBill(householdId, billId,
                userDetails != null ? userDetails.getUserId() : null);
        return ResponseEntity.ok(response);
    }
}
