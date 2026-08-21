package com.apartment.survival.expense.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Expense Domain Models Unit Tests")
class ExpenseModelTest {

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID PAYER_ID = UUID.randomUUID();
    private static final UUID MEMBER_ID = UUID.randomUUID();
    private static final Currency MAD = Currency.getInstance("MAD");

    @Test
    @DisplayName("Should maintain bidirectional split relationship when adding and removing splits")
    void expense_SplitRelationshipManagement() {
        Expense expense = Expense.builder()
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(PAYER_ID)
                .title("Groceries")
                .amount(new BigDecimal("100.00"))
                .currency(MAD)
                .category(ExpenseCategory.GROCERIES)
                .splitType(SplitType.EQUAL)
                .build();

        ExpenseSplit split = ExpenseSplit.builder()
                .userId(MEMBER_ID)
                .assignedAmount(new BigDecimal("50.00"))
                .build();

        expense.addSplit(split);
        assertThat(expense.getSplits()).contains(split);
        assertThat(split.getExpense()).isEqualTo(expense);
        assertThat(expense.getParticipantCount()).isEqualTo(1);

        expense.removeSplit(split);
        assertThat(expense.getSplits()).doesNotContain(split);
        assertThat(split.getExpense()).isNull();
        assertThat(expense.getParticipantCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should clear all splits maintaining relationship cleanup")
    void expense_ClearSplits() {
        Expense expense = Expense.builder()
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(PAYER_ID)
                .title("Wi-Fi")
                .amount(new BigDecimal("200.00"))
                .currency(MAD)
                .category(ExpenseCategory.UTILITIES)
                .splitType(SplitType.EQUAL)
                .build();

        ExpenseSplit split1 = ExpenseSplit.builder().userId(PAYER_ID).assignedAmount(new BigDecimal("100.00")).build();
        ExpenseSplit split2 = ExpenseSplit.builder().userId(MEMBER_ID).assignedAmount(new BigDecimal("100.00")).build();

        expense.addSplit(split1);
        expense.addSplit(split2);
        assertThat(expense.getSplits()).hasSize(2);
        assertThat(expense.getParticipantCount()).isEqualTo(2);

        expense.clearSplits();
        assertThat(expense.getSplits()).isEmpty();
        assertThat(expense.getParticipantCount()).isEqualTo(0);
        assertThat(split1.getExpense()).isNull();
        assertThat(split2.getExpense()).isNull();
    }

    @Test
    @DisplayName("Should instantiate Settlement with audit timestamps and non-null values")
    void settlement_Instantiation() {
        Settlement settlement = Settlement.builder()
                .householdId(HOUSEHOLD_ID)
                .payerUserId(MEMBER_ID)
                .recipientUserId(PAYER_ID)
                .amount(new BigDecimal("150.00"))
                .currency(MAD)
                .notes("Wafacash transfer")
                .build();

        assertThat(settlement.getAmount()).isEqualByComparingTo("150.00");
        assertThat(settlement.getCurrency()).isEqualTo(MAD);
        assertThat(settlement.getNotes()).isEqualTo("Wafacash transfer");
        assertThat(settlement.getSettledAt()).isNotNull();
    }
}
