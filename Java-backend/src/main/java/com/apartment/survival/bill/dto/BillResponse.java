package com.apartment.survival.bill.dto;

import java.math.BigDecimal;
import java.util.UUID;

public interface BillResponse {

    record Detail(
        UUID id,
        String title,
        String dueText,
        int dueDays,
        BigDecimal amount,
        String currency,
        boolean autoSplit,
        String perPersonText,
        String iconName,
        boolean isPaid
    ) {}

    record PayResponse(
        boolean success,
        UUID billId
    ) {}
}
