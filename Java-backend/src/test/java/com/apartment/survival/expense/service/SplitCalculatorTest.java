package com.apartment.survival.expense.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.model.SplitType;

@DisplayName("SplitCalculator Unit Tests")
class SplitCalculatorTest {

    private SplitCalculator calculator;

    private static final UUID USER_1 = UUID.randomUUID();
    private static final UUID USER_2 = UUID.randomUUID();
    private static final UUID USER_3 = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        calculator = new SplitCalculator();
    }

    @Nested
    @DisplayName("Validation & Preconditions")
    class PreconditionTests {

        @Test
        @DisplayName("Should throw BadRequestException when total amount is zero or negative")
        void totalAmount_MustBePositive() {
            var items = List.of(new ExpenseRequest.SplitItem(USER_1, null, null, null));

            assertThatThrownBy(() -> calculator.calculate(BigDecimal.ZERO, SplitType.EQUAL, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Expense total amount must be strictly greater than zero");

            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("-10.00"), SplitType.EQUAL, items))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("Should throw BadRequestException when items list is empty or null")
        void items_MustNotBeEmpty() {
            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("100.00"), SplitType.EQUAL, List.of()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("At least one participant is required");
        }

        @Test
        @DisplayName("Should throw BadRequestException on duplicate participant user IDs")
        void duplicateParticipants_Rejected() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, null, null),
                    new ExpenseRequest.SplitItem(USER_1, null, null, null)
            );

            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("100.00"), SplitType.EQUAL, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Duplicate participant found");
        }

        @Test
        @DisplayName("Should throw BadRequestException when expense amount is too small for participant count")
        void minimumSplitThreshold_Enforced() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(UUID.randomUUID(), null, null, null),
                    new ExpenseRequest.SplitItem(UUID.randomUUID(), null, null, null),
                    new ExpenseRequest.SplitItem(UUID.randomUUID(), null, null, null),
                    new ExpenseRequest.SplitItem(UUID.randomUUID(), null, null, null),
                    new ExpenseRequest.SplitItem(UUID.randomUUID(), null, null, null)
            );

            // 0.02 MAD among 5 people requires at least 0.05 MAD (0.01 per person)
            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("0.02"), SplitType.EQUAL, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Expense amount is too small to divide among 5 participants");
        }
    }

    @Nested
    @DisplayName("EQUAL Split Calculation")
    class EqualSplitTests {

        @Test
        @DisplayName("Should split evenly when divisible with no remainder (100.00 among 2 = 50.00, 50.00)")
        void exactEqualDivision() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, null, null),
                    new ExpenseRequest.SplitItem(USER_2, null, null, null)
            );

            List<SplitCalculator.CalculatedSplit> results =
                    calculator.calculate(new BigDecimal("100.00"), SplitType.EQUAL, items);

            assertThat(results).hasSize(2);
            assertThat(results.get(0).assignedAmount()).isEqualByComparingTo("50.00");
            assertThat(results.get(1).assignedAmount()).isEqualByComparingTo("50.00");
        }

        @Test
        @DisplayName("Should distribute 1-cent remainder to the first participant (100.00 among 3 = 33.34, 33.33, 33.33)")
        void equalWithRemainderCents() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, null, null),
                    new ExpenseRequest.SplitItem(USER_2, null, null, null),
                    new ExpenseRequest.SplitItem(USER_3, null, null, null)
            );

            List<SplitCalculator.CalculatedSplit> results =
                    calculator.calculate(new BigDecimal("100.00"), SplitType.EQUAL, items);

            assertThat(results).hasSize(3);
            assertThat(results.get(0).assignedAmount()).isEqualByComparingTo("33.34");
            assertThat(results.get(1).assignedAmount()).isEqualByComparingTo("33.33");
            assertThat(results.get(2).assignedAmount()).isEqualByComparingTo("33.33");

            BigDecimal sum = results.stream().map(SplitCalculator.CalculatedSplit::assignedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            assertThat(sum).isEqualByComparingTo("100.00");
        }
    }

    @Nested
    @DisplayName("EXACT Split Calculation")
    class ExactSplitTests {

        @Test
        @DisplayName("Should accept exact amounts that sum to total")
        void exactMatchesTotal() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, new BigDecimal("60.50"), null, null),
                    new ExpenseRequest.SplitItem(USER_2, new BigDecimal("39.50"), null, null)
            );

            List<SplitCalculator.CalculatedSplit> results =
                    calculator.calculate(new BigDecimal("100.00"), SplitType.EXACT, items);

            assertThat(results).hasSize(2);
            assertThat(results.get(0).assignedAmount()).isEqualByComparingTo("60.50");
            assertThat(results.get(1).assignedAmount()).isEqualByComparingTo("39.50");
        }

        @Test
        @DisplayName("Should throw BadRequestException if sum of exact amounts does not match total")
        void exactSumMismatch() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, new BigDecimal("60.00"), null, null),
                    new ExpenseRequest.SplitItem(USER_2, new BigDecimal("30.00"), null, null)
            );

            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("100.00"), SplitType.EXACT, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Exact splits sum (90.00) does not match total expense amount (100.00)");
        }
    }

    @Nested
    @DisplayName("PERCENTAGE Split Calculation")
    class PercentageSplitTests {

        @Test
        @DisplayName("Should allocate percentages and distribute rounding remainders")
        void percentageAllocation() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, new BigDecimal("33.33"), null),
                    new ExpenseRequest.SplitItem(USER_2, null, new BigDecimal("33.33"), null),
                    new ExpenseRequest.SplitItem(USER_3, null, new BigDecimal("33.34"), null)
            );

            List<SplitCalculator.CalculatedSplit> results =
                    calculator.calculate(new BigDecimal("100.00"), SplitType.PERCENTAGE, items);

            assertThat(results).hasSize(3);
            BigDecimal sum = results.stream().map(SplitCalculator.CalculatedSplit::assignedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            assertThat(sum).isEqualByComparingTo("100.00");
        }

        @Test
        @DisplayName("Should reject percentage splits that do not sum to 100.00%")
        void percentageMustTotal100() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, new BigDecimal("50.00"), null),
                    new ExpenseRequest.SplitItem(USER_2, null, new BigDecimal("40.00"), null)
            );

            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("100.00"), SplitType.PERCENTAGE, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Percentages must sum to exactly 100%");
        }

        @Test
        @DisplayName("Should reject 99.999% total percentage false positive")
        void percentageFalsePositive_Rejected() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, new BigDecimal("33.333"), null),
                    new ExpenseRequest.SplitItem(USER_2, null, new BigDecimal("33.333"), null),
                    new ExpenseRequest.SplitItem(USER_3, null, new BigDecimal("33.333"), null)
            );

            assertThatThrownBy(() -> calculator.calculate(new BigDecimal("100.00"), SplitType.PERCENTAGE, items))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Percentages must sum to exactly 100%");
        }
    }

    @Nested
    @DisplayName("SHARES Split Calculation")
    class SharesSplitTests {

        @Test
        @DisplayName("Should calculate weighted proportions from shares (2 shares vs 1 share of 150.00 = 100.00, 50.00)")
        void sharesAllocation() {
            var items = List.of(
                    new ExpenseRequest.SplitItem(USER_1, null, null, new BigDecimal("2")),
                    new ExpenseRequest.SplitItem(USER_2, null, null, new BigDecimal("1"))
            );

            List<SplitCalculator.CalculatedSplit> results =
                    calculator.calculate(new BigDecimal("150.00"), SplitType.SHARES, items);

            assertThat(results).hasSize(2);
            assertThat(results.get(0).assignedAmount()).isEqualByComparingTo("100.00");
            assertThat(results.get(1).assignedAmount()).isEqualByComparingTo("50.00");
        }
    }
}
