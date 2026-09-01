package com.apartment.survival.bill.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.bill.dto.BillRequest;
import com.apartment.survival.bill.dto.BillResponse;
import com.apartment.survival.bill.model.Bill;
import com.apartment.survival.bill.repository.BillRepository;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final HouseholdPublicApi householdPublicApi;

    @Transactional(readOnly = true)
    public List<BillResponse.Detail> getBills(UUID householdId) {
        HouseholdPublicDto household = householdPublicApi.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found: " + householdId));
        int memberCount = Math.max(1, householdPublicApi.getActiveMemberUserIds(householdId).size());
        String currency = household.currency() != null ? household.currency().getCurrencyCode() : "MAD";

        return billRepository.findActiveByHouseholdId(householdId).stream()
                .map(bill -> toDetail(bill, memberCount, currency))
                .toList();
    }

    @Transactional
    public BillResponse.Detail createBill(UUID householdId, BillRequest.Create request) {
        HouseholdPublicDto household = householdPublicApi.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found: " + householdId));
        int memberCount = Math.max(1, householdPublicApi.getActiveMemberUserIds(householdId).size());
        String currency = household.currency() != null ? household.currency().getCurrencyCode() : "MAD";

        String computedDueText = formatDueText(request.dueDays());

        Bill bill = Bill.builder()
                .householdId(householdId)
                .title(request.title().trim())
                .amount(request.amount())
                .currency(currency)
                .dueDays(request.dueDays())
                .dueText(computedDueText)
                .autoSplit(Boolean.TRUE.equals(request.autoSplit()))
                .iconName(request.iconName() != null ? request.iconName().trim().toLowerCase() : "home")
                .isPaid(false)
                .deleted(false)
                .build();

        Bill saved = billRepository.save(bill);
        return toDetail(saved, memberCount, currency);
    }

    @Transactional
    public BillResponse.PayResponse payBill(UUID householdId, UUID billId, UUID paidByUserId) {
        Bill bill = billRepository.findByIdAndHouseholdId(billId, householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found: " + billId));

        bill.setPaid(true);
        bill.setPaidAt(Instant.now());
        bill.setPaidByUserId(paidByUserId);
        billRepository.save(bill);

        return new BillResponse.PayResponse(true, billId);
    }

    private BillResponse.Detail toDetail(Bill bill, int memberCount, String fallbackCurrency) {
        String currency = bill.getCurrency() != null ? bill.getCurrency() : fallbackCurrency;
        String perPerson = calculatePerPerson(bill.getAmount(), memberCount, currency);
        String dueText = bill.getDueText() != null ? bill.getDueText() : formatDueText(bill.getDueDays());

        return new BillResponse.Detail(
                bill.getId(),
                bill.getTitle(),
                dueText,
                bill.getDueDays() != null ? bill.getDueDays() : 0,
                bill.getAmount(),
                currency,
                bill.isAutoSplit(),
                perPerson,
                bill.getIconName(),
                bill.isPaid()
        );
    }

    private String calculatePerPerson(BigDecimal totalAmount, int memberCount, String currency) {
        if (memberCount <= 0 || totalAmount == null) {
            return null;
        }
        BigDecimal perPerson = totalAmount.divide(BigDecimal.valueOf(memberCount), 0, RoundingMode.HALF_UP);
        return String.format("%s %s / person (%d roommates)", perPerson.toPlainString(), currency, memberCount);
    }

    private String formatDueText(Integer dueDays) {
        if (dueDays == null || dueDays == 0) {
            return "Due today";
        } else if (dueDays == 1) {
            return "Due tomorrow";
        } else if (dueDays < 0) {
            return "Overdue by " + Math.abs(dueDays) + " days";
        } else {
            return "Due in " + dueDays + " days";
        }
    }
}

