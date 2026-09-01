package com.apartment.survival.expense.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import org.springframework.stereotype.Component;

import com.apartment.survival.expense.dto.BalanceResponse;
import com.apartment.survival.expense.model.Expense;
import com.apartment.survival.expense.model.ExpenseSplit;
import com.apartment.survival.expense.model.Settlement;

@Component
public class BalanceCalculator {

    public BalanceResponse.HouseholdBalances calculateBalances(
            UUID householdId,
            Currency currency,
            Set<UUID> memberUserIds,
            List<Expense> expenses,
            List<Settlement> settlements,
            Map<UUID, String> usernames) {
        return calculateBalances(householdId, currency, "DEBT_SIMPLIFIED", memberUserIds, expenses, settlements, usernames);
    }

    public BalanceResponse.HouseholdBalances calculateBalances(
            UUID householdId,
            Currency currency,
            String splitAlgorithm,
            Set<UUID> memberUserIds,
            List<Expense> expenses,
            List<Settlement> settlements,
            Map<UUID, String> usernames) {

        // Multi-Currency Validation Guard
        if (currency != null) {
            for (Expense expense : expenses) {
                if (expense.getCurrency() != null && !currency.equals(expense.getCurrency())) {
                    throw new IllegalArgumentException(
                        "Expense currency mismatch: expected " + currency + " but found " + expense.getCurrency()
                    );
                }
            }
            for (Settlement settlement : settlements) {
                if (settlement.getCurrency() != null && !currency.equals(settlement.getCurrency())) {
                    throw new IllegalArgumentException(
                        "Settlement currency mismatch: expected " + currency + " but found " + settlement.getCurrency()
                    );
                }
            }
        }

        // 1. Initialize user balances for all active household members
        Map<UUID, UserBalanceAccumulator> accumulators = new LinkedHashMap<>();
        for (UUID userId : memberUserIds) {
            accumulators.put(userId, new UserBalanceAccumulator(userId));
        }

        // Also track any non-member users who might have historical splits/payments
        for (Expense expense : expenses) {
            accumulators.putIfAbsent(expense.getPaidByUserId(), new UserBalanceAccumulator(expense.getPaidByUserId()));
            for (ExpenseSplit split : expense.getSplits()) {
                accumulators.putIfAbsent(split.getUserId(), new UserBalanceAccumulator(split.getUserId()));
            }
        }
        for (Settlement settlement : settlements) {
            accumulators.putIfAbsent(settlement.getPayerUserId(), new UserBalanceAccumulator(settlement.getPayerUserId()));
            accumulators.putIfAbsent(settlement.getRecipientUserId(), new UserBalanceAccumulator(settlement.getRecipientUserId()));
        }

        // 2. Accumulate Expenses & Splits
        for (Expense expense : expenses) {
            UserBalanceAccumulator payer = accumulators.get(expense.getPaidByUserId());
            if (payer != null) {
                payer.addPaid(expense.getAmount());
            }

            for (ExpenseSplit split : expense.getSplits()) {
                UserBalanceAccumulator participant = accumulators.get(split.getUserId());
                if (participant != null) {
                    participant.addAssigned(split.getAssignedAmount());
                }
            }
        }

        // 3. Accumulate Settlements
        for (Settlement settlement : settlements) {
            UserBalanceAccumulator payer = accumulators.get(settlement.getPayerUserId());
            if (payer != null) {
                payer.addSettledPaid(settlement.getAmount());
            }

            UserBalanceAccumulator recipient = accumulators.get(settlement.getRecipientUserId());
            if (recipient != null) {
                recipient.addSettledReceived(settlement.getAmount());
            }
        }

        // 4. Build UserBalance response items
        List<BalanceResponse.UserBalance> userBalances = new ArrayList<>();
        for (UserBalanceAccumulator acc : accumulators.values()) {
            String username = usernames.getOrDefault(acc.userId, "Unknown User");
            userBalances.add(new BalanceResponse.UserBalance(
                    acc.userId,
                    username,
                    acc.totalPaid.setScale(2, RoundingMode.HALF_EVEN),
                    acc.totalAssigned.setScale(2, RoundingMode.HALF_EVEN),
                    acc.totalSettledPaid.setScale(2, RoundingMode.HALF_EVEN),
                    acc.totalSettledReceived.setScale(2, RoundingMode.HALF_EVEN),
                    acc.getNetBalance().setScale(2, RoundingMode.HALF_EVEN)
            ));
        }

        // 5. Compute Debts based on Household Split Algorithm
        List<BalanceResponse.DebtTransfer> debtTransfers;
        if ("DIRECT".equalsIgnoreCase(splitAlgorithm)) {
            debtTransfers = computeDirectDebts(expenses, settlements, usernames);
        } else {
            debtTransfers = computeSimplifiedDebts(accumulators.values(), usernames);
        }

        return new BalanceResponse.HouseholdBalances(householdId, currency, userBalances, debtTransfers);
    }

    private List<BalanceResponse.DebtTransfer> computeDirectDebts(
            List<Expense> expenses,
            List<Settlement> settlements,
            Map<UUID, String> usernames) {

        Map<UUID, Map<UUID, BigDecimal>> pairwiseDebts = new HashMap<>();

        // Helper to record debtor -> creditor amount
        for (Expense expense : expenses) {
            UUID payerId = expense.getPaidByUserId();
            for (ExpenseSplit split : expense.getSplits()) {
                UUID participantId = split.getUserId();
                if (!participantId.equals(payerId)) {
                    BigDecimal amount = split.getAssignedAmount();
                    if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
                        pairwiseDebts.computeIfAbsent(participantId, k -> new HashMap<>())
                                .merge(payerId, amount, BigDecimal::add);
                    }
                }
            }
        }

        // Settlements reduce direct debtor liability
        for (Settlement settlement : settlements) {
            UUID payerId = settlement.getPayerUserId();
            UUID recipientId = settlement.getRecipientUserId();
            BigDecimal amount = settlement.getAmount();
            if (!payerId.equals(recipientId) && amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
                // Payer paying recipient reduces what payer owes recipient (or increases what recipient owes payer)
                pairwiseDebts.computeIfAbsent(recipientId, k -> new HashMap<>())
                        .merge(payerId, amount, BigDecimal::add);
            }
        }

        // Consolidate pairwise net debts
        List<BalanceResponse.DebtTransfer> transfers = new ArrayList<>();
        Set<String> processedPairs = new HashSet<>();

        Set<UUID> allUsers = new HashSet<>(pairwiseDebts.keySet());
        for (Map<UUID, BigDecimal> creditors : pairwiseDebts.values()) {
            allUsers.addAll(creditors.keySet());
        }

        List<UUID> userList = new ArrayList<>(allUsers);
        for (int i = 0; i < userList.size(); i++) {
            for (int j = i + 1; j < userList.size(); j++) {
                UUID userA = userList.get(i);
                UUID userB = userList.get(j);

                BigDecimal aOwesB = pairwiseDebts.getOrDefault(userA, Collections.emptyMap()).getOrDefault(userB, BigDecimal.ZERO);
                BigDecimal bOwesA = pairwiseDebts.getOrDefault(userB, Collections.emptyMap()).getOrDefault(userA, BigDecimal.ZERO);

                BigDecimal net = aOwesB.subtract(bOwesA);
                if (net.compareTo(new BigDecimal("0.005")) > 0) {
                    String fromName = usernames.getOrDefault(userA, "Unknown User");
                    String toName = usernames.getOrDefault(userB, "Unknown User");
                    transfers.add(new BalanceResponse.DebtTransfer(
                            userA,
                            fromName,
                            userB,
                            toName,
                            net.setScale(2, RoundingMode.HALF_EVEN)
                    ));
                } else if (net.compareTo(new BigDecimal("-0.005")) < 0) {
                    String fromName = usernames.getOrDefault(userB, "Unknown User");
                    String toName = usernames.getOrDefault(userA, "Unknown User");
                    transfers.add(new BalanceResponse.DebtTransfer(
                            userB,
                            fromName,
                            userA,
                            toName,
                            net.abs().setScale(2, RoundingMode.HALF_EVEN)
                    ));
                }
            }
        }

        return transfers;
    }

    private List<BalanceResponse.DebtTransfer> computeSimplifiedDebts(
            Collection<UserBalanceAccumulator> balances,
            Map<UUID, String> usernames) {

        Comparator<NetEntry> netComparator = Comparator
                .comparing(NetEntry::amount)
                .thenComparing(NetEntry::userId)
                .reversed();

        PriorityQueue<NetEntry> debtors = new PriorityQueue<>(netComparator);
        PriorityQueue<NetEntry> creditors = new PriorityQueue<>(netComparator);

        for (UserBalanceAccumulator acc : balances) {
            BigDecimal net = acc.getNetBalance().setScale(2, RoundingMode.HALF_EVEN);
            int comparison = net.compareTo(BigDecimal.ZERO);

            if (comparison < 0) {
                debtors.add(new NetEntry(acc.userId, net.abs()));
            } else if (comparison > 0) {
                creditors.add(new NetEntry(acc.userId, net));
            }
        }

        List<BalanceResponse.DebtTransfer> transfers = new ArrayList<>();

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            NetEntry debtor = debtors.poll();
            NetEntry creditor = creditors.poll();

            BigDecimal settlementAmount = debtor.amount.min(creditor.amount);
            if (settlementAmount.compareTo(BigDecimal.ZERO) > 0) {
                String fromName = usernames.getOrDefault(debtor.userId, "Unknown User");
                String toName = usernames.getOrDefault(creditor.userId, "Unknown User");

                transfers.add(new BalanceResponse.DebtTransfer(
                        debtor.userId,
                        fromName,
                        creditor.userId,
                        toName,
                        settlementAmount
                ));
            }

            BigDecimal remainingDebt = debtor.amount.subtract(settlementAmount);
            BigDecimal remainingCredit = creditor.amount.subtract(settlementAmount);

            if (remainingDebt.compareTo(BigDecimal.ZERO) > 0) {
                debtors.add(new NetEntry(debtor.userId, remainingDebt));
            }
            if (remainingCredit.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new NetEntry(creditor.userId, remainingCredit));
            }
        }

        // Invariant verification: all debts and credits must balance to zero
        if (!debtors.isEmpty() || !creditors.isEmpty()) {
            throw new IllegalStateException(
                "Ledger math imbalance: total debts and credits do not sum to zero. Check for corrupt expense splits."
            );
        }

        return transfers;
    }

    private record NetEntry(UUID userId, BigDecimal amount) {}

    private static class UserBalanceAccumulator {
        private final UUID userId;
        private BigDecimal totalPaid = BigDecimal.ZERO;
        private BigDecimal totalAssigned = BigDecimal.ZERO;
        private BigDecimal totalSettledPaid = BigDecimal.ZERO;
        private BigDecimal totalSettledReceived = BigDecimal.ZERO;

        public UserBalanceAccumulator(UUID userId) {
            this.userId = userId;
        }

        public void addPaid(BigDecimal amount) {
            if (amount != null) totalPaid = totalPaid.add(amount);
        }

        public void addAssigned(BigDecimal amount) {
            if (amount != null) totalAssigned = totalAssigned.add(amount);
        }

        public void addSettledPaid(BigDecimal amount) {
            if (amount != null) totalSettledPaid = totalSettledPaid.add(amount);
        }

        public void addSettledReceived(BigDecimal amount) {
            if (amount != null) totalSettledReceived = totalSettledReceived.add(amount);
        }

        public BigDecimal getNetBalance() {
            // Net = (totalPaid - totalAssigned) + (totalSettledPaid - totalSettledReceived)
            return totalPaid.subtract(totalAssigned)
                    .add(totalSettledPaid)
                    .subtract(totalSettledReceived);
        }
    }
}
