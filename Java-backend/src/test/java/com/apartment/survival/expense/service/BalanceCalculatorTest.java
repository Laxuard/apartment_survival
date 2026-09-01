package com.apartment.survival.expense.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.apartment.survival.expense.dto.BalanceResponse;
import com.apartment.survival.expense.model.Expense;
import com.apartment.survival.expense.model.ExpenseCategory;
import com.apartment.survival.expense.model.ExpenseSplit;
import com.apartment.survival.expense.model.Settlement;
import com.apartment.survival.expense.model.SplitType;

@DisplayName("BalanceCalculator Unit Tests")
class BalanceCalculatorTest {

    private BalanceCalculator balanceCalculator;

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID ALICE = UUID.randomUUID();
    private static final UUID BOB = UUID.randomUUID();
    private static final UUID CHARLIE = UUID.randomUUID();
    private static final Currency MAD = Currency.getInstance("MAD");
    private static final Currency EUR = Currency.getInstance("EUR");

    private Map<UUID, String> usernames;

    @BeforeEach
    void setUp() {
        balanceCalculator = new BalanceCalculator();
        usernames = Map.of(
                ALICE, "Alice",
                BOB, "Bob",
                CHARLIE, "Charlie"
        );
    }

    @Test
    @DisplayName("Should correctly calculate balances and simplified debts for single shared expense")
    void singleExpense_BalancesAndDebts() {
        // Alice pays 300 MAD, split equally among Alice, Bob, Charlie (100 each)
        Expense expense = Expense.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(ALICE)
                .amount(new BigDecimal("300.00"))
                .currency(MAD)
                .category(ExpenseCategory.GROCERIES)
                .splitType(SplitType.EQUAL)
                .build();

        expense.addSplit(ExpenseSplit.builder().userId(ALICE).assignedAmount(new BigDecimal("100.00")).build());
        expense.addSplit(ExpenseSplit.builder().userId(BOB).assignedAmount(new BigDecimal("100.00")).build());
        expense.addSplit(ExpenseSplit.builder().userId(CHARLIE).assignedAmount(new BigDecimal("100.00")).build());

        BalanceResponse.HouseholdBalances result = balanceCalculator.calculateBalances(
                HOUSEHOLD_ID,
                MAD,
                Set.of(ALICE, BOB, CHARLIE),
                List.of(expense),
                List.of(),
                usernames
        );

        assertThat(result.householdId()).isEqualTo(HOUSEHOLD_ID);
        assertThat(result.currency()).isEqualTo(MAD);

        // Verify individual net balances
        Map<UUID, BigDecimal> netMap = result.members().stream()
                .collect(java.util.stream.Collectors.toMap(BalanceResponse.UserBalance::userId, BalanceResponse.UserBalance::netBalance));

        assertThat(netMap.get(ALICE)).isEqualByComparingTo("200.00");
        assertThat(netMap.get(BOB)).isEqualByComparingTo("-100.00");
        assertThat(netMap.get(CHARLIE)).isEqualByComparingTo("-100.00");

        // Verify simplified debts: Bob pays Alice 100, Charlie pays Alice 100
        assertThat(result.simplifiedDebts()).hasSize(2);
        assertThat(result.simplifiedDebts()).anySatisfy(d -> {
            assertThat(d.fromUserId()).isEqualTo(BOB);
            assertThat(d.toUserId()).isEqualTo(ALICE);
            assertThat(d.amount()).isEqualByComparingTo("100.00");
        });
        assertThat(result.simplifiedDebts()).anySatisfy(d -> {
            assertThat(d.fromUserId()).isEqualTo(CHARLIE);
            assertThat(d.toUserId()).isEqualTo(ALICE);
            assertThat(d.amount()).isEqualByComparingTo("100.00");
        });
    }

    @Test
    @DisplayName("Should adjust balances when a settlement payment is recorded")
    void settlement_AdjustsBalances() {
        Expense expense = Expense.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(ALICE)
                .amount(new BigDecimal("300.00"))
                .currency(MAD)
                .category(ExpenseCategory.GROCERIES)
                .splitType(SplitType.EQUAL)
                .build();

        expense.addSplit(ExpenseSplit.builder().userId(ALICE).assignedAmount(new BigDecimal("100.00")).build());
        expense.addSplit(ExpenseSplit.builder().userId(BOB).assignedAmount(new BigDecimal("100.00")).build());
        expense.addSplit(ExpenseSplit.builder().userId(CHARLIE).assignedAmount(new BigDecimal("100.00")).build());

        // Bob settles 100.00 to Alice
        Settlement settlement = Settlement.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .payerUserId(BOB)
                .recipientUserId(ALICE)
                .amount(new BigDecimal("100.00"))
                .currency(MAD)
                .build();

        BalanceResponse.HouseholdBalances result = balanceCalculator.calculateBalances(
                HOUSEHOLD_ID,
                MAD,
                Set.of(ALICE, BOB, CHARLIE),
                List.of(expense),
                List.of(settlement),
                usernames
        );

        Map<UUID, BigDecimal> netMap = result.members().stream()
                .collect(java.util.stream.Collectors.toMap(BalanceResponse.UserBalance::userId, BalanceResponse.UserBalance::netBalance));

        // Alice is now owed only 100 (from Charlie), Bob is fully settled (0), Charlie owes 100
        assertThat(netMap.get(ALICE)).isEqualByComparingTo("100.00");
        assertThat(netMap.get(BOB)).isEqualByComparingTo("0.00");
        assertThat(netMap.get(CHARLIE)).isEqualByComparingTo("-100.00");

        // Only 1 debt remains: Charlie pays Alice 100
        assertThat(result.simplifiedDebts()).hasSize(1);
        BalanceResponse.DebtTransfer debt = result.simplifiedDebts().get(0);
        assertThat(debt.fromUserId()).isEqualTo(CHARLIE);
        assertThat(debt.toUserId()).isEqualTo(ALICE);
        assertThat(debt.amount()).isEqualByComparingTo("100.00");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when currency mismatch is detected")
    void currencyMismatch_ThrowsException() {
        Expense expense = Expense.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(ALICE)
                .amount(new BigDecimal("100.00"))
                .currency(EUR)
                .category(ExpenseCategory.GROCERIES)
                .splitType(SplitType.EQUAL)
                .build();

        assertThatThrownBy(() -> balanceCalculator.calculateBalances(
                HOUSEHOLD_ID,
                MAD,
                Set.of(ALICE),
                List.of(expense),
                List.of(),
                usernames
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Expense currency mismatch");
    }

    @Test
    @DisplayName("Should correctly calculate direct 1-to-1 debts when DIRECT split algorithm is selected")
    void directAlgorithm_PairwiseDebts() {
        // Alice pays 300 MAD, split Bob (100) and Charlie (200)
        Expense expense = Expense.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .paidByUserId(ALICE)
                .amount(new BigDecimal("300.00"))
                .currency(MAD)
                .category(ExpenseCategory.GROCERIES)
                .splitType(SplitType.EXACT)
                .build();
        expense.addSplit(ExpenseSplit.builder().userId(BOB).assignedAmount(new BigDecimal("100.00")).build());
        expense.addSplit(ExpenseSplit.builder().userId(CHARLIE).assignedAmount(new BigDecimal("200.00")).build());

        // Bob settles 50 with Alice
        Settlement settlement = Settlement.builder()
                .id(UUID.randomUUID())
                .householdId(HOUSEHOLD_ID)
                .payerUserId(BOB)
                .recipientUserId(ALICE)
                .amount(new BigDecimal("50.00"))
                .currency(MAD)
                .build();

        BalanceResponse.HouseholdBalances result = balanceCalculator.calculateBalances(
                HOUSEHOLD_ID,
                MAD,
                "DIRECT",
                Set.of(ALICE, BOB, CHARLIE),
                List.of(expense),
                List.of(settlement),
                usernames
        );

        // Bob owes Alice 50, Charlie owes Alice 200
        assertThat(result.simplifiedDebts()).hasSize(2);

        BalanceResponse.DebtTransfer bobToAlice = result.simplifiedDebts().stream()
                .filter(d -> d.fromUserId().equals(BOB))
                .findFirst().orElseThrow();
        assertThat(bobToAlice.toUserId()).isEqualTo(ALICE);
        assertThat(bobToAlice.amount()).isEqualByComparingTo("50.00");

        BalanceResponse.DebtTransfer charlieToAlice = result.simplifiedDebts().stream()
                .filter(d -> d.fromUserId().equals(CHARLIE))
                .findFirst().orElseThrow();
        assertThat(charlieToAlice.toUserId()).isEqualTo(ALICE);
        assertThat(charlieToAlice.amount()).isEqualByComparingTo("200.00");
    }
}
