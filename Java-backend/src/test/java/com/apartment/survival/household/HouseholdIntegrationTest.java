package com.apartment.survival.household;

import java.util.Currency;
import java.util.UUID;

import jakarta.servlet.http.HttpSession;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Household Module Integration Tests")
class HouseholdIntegrationTest {

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

        private static final String AUTH_REGISTER_URL = "/api/auth/register";
        private static final String HOUSEHOLDS_URL = "/api/households";

        @BeforeEach
        void cleanDatabase() {
                memberRepository.deleteAll();
                householdRepository.deleteAll();
                userRepository.deleteAll();
        }

        private HttpSession registerAndLogin(String email, String username, String password) throws Exception {
                AuthRequest.Register register = new AuthRequest.Register(email, username, password);
                MvcResult result = mockMvc.perform(post(AUTH_REGISTER_URL)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(register)))
                                .andExpect(status().isCreated())
                                .andReturn();

                return result.getRequest().getSession(false);
        }

        // ==========================================
        // 1. END-TO-END LIFECYCLE
        // ==========================================
        @Nested
        @DisplayName("Household Lifecycle Integration Flow")
        class LifecycleTests {

                @Test
                @DisplayName("Should create household, list it, view detail, update settings, and archive it")
                void fullHouseholdLifecycle() throws Exception {
                        // 1. Register User A
                        var sessionA = (org.springframework.mock.web.MockHttpSession) registerAndLogin("alice@test.com",
                                        "Alice", "Password123!");

                        // 2. User A creates Household
                        var createRequest = new HouseholdRequest.Create("Sunshine Villa", "Beachside Apartment",
                                        Currency.getInstance("MAD"), null);
                        MvcResult createResult = mockMvc.perform(post(HOUSEHOLDS_URL)
                                        .session(sessionA)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(createRequest)))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.householdId").isNotEmpty())
                                        .andExpect(jsonPath("$.name").value("Sunshine Villa"))
                                        .andExpect(jsonPath("$.memberCount").value(1))
                                        .andReturn();

                        String responseJson = createResult.getResponse().getContentAsString();
                        HouseholdResponse.Summary created = objectMapper.readValue(responseJson,
                                        HouseholdResponse.Summary.class);
                        UUID householdId = created.householdId();

                        // 3. User A lists households
                        mockMvc.perform(get(HOUSEHOLDS_URL).session(sessionA))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$[0].householdId").value(householdId.toString()))
                                        .andExpect(jsonPath("$[0].name").value("Sunshine Villa"));

                        // 4. User A views detailed household with roommates
                        mockMvc.perform(get(HOUSEHOLDS_URL + "/{householdId}", householdId).session(sessionA))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.householdId").value(householdId.toString()))
                                        .andExpect(jsonPath("$.members[0].username").value("Alice"))
                                        .andExpect(jsonPath("$.members[0].role").value("ADMIN"));

                        // 5. User A updates household settings
                        var updateRequest = new HouseholdRequest.Update("Sunny Villa Renovated", "New Description",
                                        null, null, null, 8);
                        mockMvc.perform(put(HOUSEHOLDS_URL + "/{householdId}", householdId)
                                        .session(sessionA)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(updateRequest)))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.name").value("Sunny Villa Renovated"));

                        // 6. User A archives the household
                        mockMvc.perform(delete(HOUSEHOLDS_URL + "/{householdId}", householdId).session(sessionA))
                                        .andExpect(status().isNoContent());

                        // Verify database state is soft-archived
                        Household archivedHousehold = householdRepository.findById(householdId).orElseThrow();
                        assertThat(archivedHousehold.isArchived()).isTrue();
                }
        }

        // ==========================================
        // 2. MULTI-TENANCY & AUTHORIZATION SECURITY
        // ==========================================
        @Nested
        @DisplayName("Multi-Tenancy Security Tests")
        class MultiTenancySecurityTests {

                @Test
                @DisplayName("Non-member (User B) should receive 403 Forbidden when attempting to access User A's household")
                void nonMember_ForbiddenAccess() throws Exception {
                        // User A creates Household
                        var sessionA = (org.springframework.mock.web.MockHttpSession) registerAndLogin("alice@test.com",
                                        "Alice", "Password123!");
                        var createRequest = new HouseholdRequest.Create("Alice Apt", null, null, null);
                        MvcResult createResult = mockMvc.perform(post(HOUSEHOLDS_URL)
                                        .session(sessionA)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(createRequest)))
                                        .andExpect(status().isCreated())
                                        .andReturn();

                        HouseholdResponse.Summary created = objectMapper.readValue(
                                        createResult.getResponse().getContentAsString(),
                                        HouseholdResponse.Summary.class);
                        UUID householdId = created.householdId();

                        // User B registers
                        var sessionB = (org.springframework.mock.web.MockHttpSession) registerAndLogin("bob@test.com",
                                        "Bob", "Password123!");

                        // User B attempts to read Alice's household -> 403 Forbidden
                        mockMvc.perform(get(HOUSEHOLDS_URL + "/{householdId}", householdId).session(sessionB))
                                        .andExpect(status().isForbidden());

                        // User B attempts to update Alice's household -> 403 Forbidden
                        var updateRequest = new HouseholdRequest.Update("Hacked Name", null, null, null, null, 10);
                        mockMvc.perform(put(HOUSEHOLDS_URL + "/{householdId}", householdId)
                                        .session(sessionB)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(updateRequest)))
                                        .andExpect(status().isForbidden());
                }
        }
}
