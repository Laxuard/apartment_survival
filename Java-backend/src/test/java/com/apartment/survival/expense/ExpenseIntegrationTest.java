package com.apartment.survival.expense;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.apartment.survival.expense.dto.BalanceResponse;
import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.dto.ExpenseResponse;
import com.apartment.survival.expense.dto.SettlementRequest;
import com.apartment.survival.expense.model.ExpenseCategory;
import com.apartment.survival.expense.model.SplitType;
import com.apartment.survival.expense.repository.ExpenseRepository;
import com.apartment.survival.expense.repository.SettlementRepository;
import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.dto.AuthResponse;
import com.apartment.survival.iam.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Expense Module Integration Tests")
class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HouseholdRepository householdRepository;

    @Autowired
    private HouseholdMemberRepository memberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    private static final String AUTH_REGISTER_URL = "/api/auth/register";
    private static final String HOUSEHOLDS_URL = "/api/households";

    @BeforeEach
    void cleanDatabase() {
        expenseRepository.deleteAll();
        settlementRepository.deleteAll();
        memberRepository.deleteAll();
        householdRepository.deleteAll();
        userRepository.deleteAll();
    }

    private UserSession registerUser(String email, String username, String password) throws Exception {
        AuthRequest.Register register = new AuthRequest.Register(email, username, password);
        MvcResult result = mockMvc.perform(post(AUTH_REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse.UserSummary user = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.UserSummary.class);
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        return new UserSession(user.userId(), user.username(), session);
    }

    private record UserSession(UUID userId, String username, MockHttpSession session) {}

    @Nested
    @DisplayName("End-to-End Expense, Balance & Settlement Flow")
    class ExpenseLifecycleFlowTests {

        @Test
        @DisplayName("Full financial flow: create equal expense, view balances, settle up, check updated debt")
        void fullFinancialFlow() throws Exception {
            // 1. Register Alice (Admin), Bob, Charlie
            UserSession alice = registerUser("alice@test.com", "Alice", "Password123!");
            UserSession bob = registerUser("bob@test.com", "Bob", "Password123!");
            UserSession charlie = registerUser("charlie@test.com", "Charlie", "Password123!");

            // 2. Alice creates Household "Sunny Palms"
            var createHousehold = new HouseholdRequest.Create("Sunny Palms", "Beach House", Currency.getInstance("MAD"), null);
            MvcResult householdResult = mockMvc.perform(post(HOUSEHOLDS_URL)
                    .session(alice.session())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createHousehold)))
                    .andExpect(status().isCreated())
                    .andReturn();

            HouseholdResponse.Summary household = objectMapper.readValue(
                    householdResult.getResponse().getContentAsString(), HouseholdResponse.Summary.class);
            UUID householdId = household.householdId();

            // Add Bob and Charlie to Household directly
            var hEntity = householdRepository.findById(householdId).orElseThrow();
            memberRepository.save(HouseholdMember.builder().household(hEntity).userId(bob.userId()).role(HouseholdRole.MEMBER).build());
            memberRepository.save(HouseholdMember.builder().household(hEntity).userId(charlie.userId()).role(HouseholdRole.MEMBER).build());

            String expensesUrl = "/api/households/" + householdId + "/expenses";
            String settlementsUrl = "/api/households/" + householdId + "/settlements";
            String balancesUrl = "/api/households/" + householdId + "/balances";

            // 3. Alice logs a 300.00 MAD Groceries Expense split EQUAL among Alice, Bob, Charlie
            var expenseRequest = new ExpenseRequest.Create(
                    "Carrefour Groceries",
                    "Weekly shopping for the flat",
                    new BigDecimal("300.00"),
                    ExpenseCategory.GROCERIES,
                    SplitType.EQUAL,
                    null,
                    null,
                    List.of(
                            new ExpenseRequest.SplitItem(alice.userId(), null, null, null),
                            new ExpenseRequest.SplitItem(bob.userId(), null, null, null),
                            new ExpenseRequest.SplitItem(charlie.userId(), null, null, null)
                    )
            );

            MvcResult expenseResult = mockMvc.perform(post(expensesUrl)
                    .session(alice.session())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.expenseId").isNotEmpty())
                    .andExpect(jsonPath("$.title").value("Carrefour Groceries"))
                    .andExpect(jsonPath("$.amount").value(300.00))
                    .andExpect(jsonPath("$.paidByUsername").value("Alice"))
                    .andExpect(jsonPath("$.splits").isArray())
                    .andReturn();

            ExpenseResponse.Detail expenseDetail = objectMapper.readValue(
                    expenseResult.getResponse().getContentAsString(), ExpenseResponse.Detail.class);
            assertThat(expenseDetail.splits()).hasSize(3);

            // 4. Bob checks household balances -> Alice is owed 200, Bob owes 100, Charlie owes 100
            MvcResult balanceResult = mockMvc.perform(get(balancesUrl).session(bob.session()))
                    .andExpect(status().isOk())
                    .andReturn();

            BalanceResponse.HouseholdBalances balances = objectMapper.readValue(
                    balanceResult.getResponse().getContentAsString(), BalanceResponse.HouseholdBalances.class);

            assertThat(balances.householdId()).isEqualTo(householdId);
            assertThat(balances.members()).hasSize(3);

            var netMap = balances.members().stream()
                    .collect(java.util.stream.Collectors.toMap(BalanceResponse.UserBalance::userId, BalanceResponse.UserBalance::netBalance));

            assertThat(netMap.get(alice.userId())).isEqualByComparingTo("200.00");
            assertThat(netMap.get(bob.userId())).isEqualByComparingTo("-100.00");
            assertThat(netMap.get(charlie.userId())).isEqualByComparingTo("-100.00");

            assertThat(balances.simplifiedDebts()).hasSize(2);

            // 5. Bob records a 100.00 MAD Settlement to Alice
            var settlementRequest = new SettlementRequest.Create(
                    alice.userId(),
                    new BigDecimal("100.00"),
                    null,
                    "Cash payment for groceries"
            );

            mockMvc.perform(post(settlementsUrl)
                    .session(bob.session())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(settlementRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.payerUsername").value("Bob"))
                    .andExpect(jsonPath("$.recipientUsername").value("Alice"))
                    .andExpect(jsonPath("$.amount").value(100.00));

            // 6. Charlie checks balances -> Alice (+100), Bob (0), Charlie (-100)
            MvcResult updatedBalanceResult = mockMvc.perform(get(balancesUrl).session(charlie.session()))
                    .andExpect(status().isOk())
                    .andReturn();

            BalanceResponse.HouseholdBalances updatedBalances = objectMapper.readValue(
                    updatedBalanceResult.getResponse().getContentAsString(), BalanceResponse.HouseholdBalances.class);

            var updatedNetMap = updatedBalances.members().stream()
                    .collect(java.util.stream.Collectors.toMap(BalanceResponse.UserBalance::userId, BalanceResponse.UserBalance::netBalance));

            assertThat(updatedNetMap.get(alice.userId())).isEqualByComparingTo("100.00");
            assertThat(updatedNetMap.get(bob.userId())).isEqualByComparingTo("0.00");
            assertThat(updatedNetMap.get(charlie.userId())).isEqualByComparingTo("-100.00");

            // Only 1 debt remains: Charlie owes Alice 100
            assertThat(updatedBalances.simplifiedDebts()).hasSize(1);
            assertThat(updatedBalances.simplifiedDebts().get(0).fromUserId()).isEqualTo(charlie.userId());
            assertThat(updatedBalances.simplifiedDebts().get(0).toUserId()).isEqualTo(alice.userId());
            assertThat(updatedBalances.simplifiedDebts().get(0).amount()).isEqualByComparingTo("100.00");

            // 7. Alice lists expenses
            mockMvc.perform(get(expensesUrl).session(alice.session()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].title").value("Carrefour Groceries"))
                    .andExpect(jsonPath("$[0].amount").value(300.00));

            // 8. Alice soft-deletes the expense
            mockMvc.perform(delete(expensesUrl + "/{expenseId}", expenseDetail.expenseId()).session(alice.session()))
                    .andExpect(status().isNoContent());

            // 9. Verify expense is no longer returned in list
            mockMvc.perform(get(expensesUrl).session(alice.session()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("Multi-Tenancy Security & Authorization Tests")
    class SecurityTests {

        @Test
        @DisplayName("Non-member (David) receives 403 Forbidden when accessing household expenses")
        void nonMember_Forbidden() throws Exception {
            UserSession alice = registerUser("alice@test.com", "Alice", "Password123!");
            UserSession david = registerUser("david@test.com", "David", "Password123!");

            var createHousehold = new HouseholdRequest.Create("Alice Villa", null, null, null);
            MvcResult householdResult = mockMvc.perform(post(HOUSEHOLDS_URL)
                    .session(alice.session())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createHousehold)))
                    .andExpect(status().isCreated())
                    .andReturn();

            HouseholdResponse.Summary household = objectMapper.readValue(
                    householdResult.getResponse().getContentAsString(), HouseholdResponse.Summary.class);
            UUID householdId = household.householdId();

            String expensesUrl = "/api/households/" + householdId + "/expenses";

            // David attempts to view expenses -> 403
            mockMvc.perform(get(expensesUrl).session(david.session()))
                    .andExpect(status().isForbidden());

            // David attempts to post expense -> 403
            var expenseRequest = new ExpenseRequest.Create(
                    "Unauthorized Expense",
                    null,
                    new BigDecimal("50.00"),
                    ExpenseCategory.OTHER,
                    SplitType.EQUAL,
                    null,
                    null,
                    List.of(new ExpenseRequest.SplitItem(david.userId(), null, null, null))
            );

            mockMvc.perform(post(expensesUrl)
                    .session(david.session())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseRequest)))
                    .andExpect(status().isForbidden());
        }
    }
}
