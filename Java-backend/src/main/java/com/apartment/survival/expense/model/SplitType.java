package com.apartment.survival.expense.model;

public enum SplitType {
    EQUAL,      // Even distribution across all selected participants
    EXACT,      // Specific currency amounts per participant
    PERCENTAGE, // Proportional allocation summing to 100.00%
    SHARES      // Weighted distribution based on fractional integer units
}
