package com.apartment.survival.household.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.apartment.survival.common.exception.ExceptionTranslator;
import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.security.HouseholdSecurityEvaluator;
import com.apartment.survival.household.service.HouseholdService;
import com.apartment.survival.iam.security.UserDetailsImpl;

@WebMvcTest(controllers = HouseholdController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("HouseholdController Slice Tests")
class HouseholdControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private HouseholdService householdService;

    @MockitoBean
    private HouseholdSecurityEvaluator householdSecurity;

    @MockitoBean
    private ExceptionTranslator exceptionTranslator;

    // === Shared Fixtures ===
    private static final UUID CURRENT_USER_ID = UUID.randomUUID();
    private static final UUID TARGET_USER_ID = UUID.randomUUID();
    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final String BASE_URL = "/api/households";
    private static final Currency MAD = Currency.getInstance("MAD");
    private static final ZoneId CASABLANCA = ZoneId.of("Africa/Casablanca");

    private static final UserDetailsImpl CURRENT_USER = new UserDetailsImpl(
            CURRENT_USER_ID, "user@test.com", "TestUser", "password", true, true, List.of()
    );

    @BeforeEach
    void setUpSecurityContext() {
        Authentication auth = new UsernamePasswordAuthenticationToken(CURRENT_USER, null, CURRENT_USER.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private HouseholdResponse.Summary buildSummary(UUID id, String name) {
        return new HouseholdResponse.Summary(id, name, "Description", null, MAD, CASABLANCA, 1, false, Instant.now());
    }

    // ==========================================
    // 1. POST /api/households (CREATE)
    // ==========================================
    @Nested
    @DisplayName("POST /api/households")
    class CreateEndpointTests {

        @Test
        @DisplayName("Should return 201 Created and Summary when request is valid")
        void create_Success() throws Exception {
            var request = new HouseholdRequest.Create("Cozy Apt", "Description", MAD, CASABLANCA);
            var summary = buildSummary(HOUSEHOLD_ID, "Cozy Apt");

            when(householdService.create(any(), eq(CURRENT_USER_ID))).thenReturn(summary);

            mockMvc.perform(post(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.householdId").value(HOUSEHOLD_ID.toString()))
                    .andExpect(jsonPath("$.name").value("Cozy Apt"));

            verify(householdService).create(any(), eq(CURRENT_USER_ID));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when name is blank or too short")
        void create_InvalidName_ReturnsBadRequest() throws Exception {
            var invalidRequest = new HouseholdRequest.Create("", "Desc", null, null);

            mockMvc.perform(post(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 2. GET /api/households (LIST MY HOUSEHOLDS)
    // ==========================================
    @Nested
    @DisplayName("GET /api/households")
    class GetMyHouseholdsTests {

        @Test
        @DisplayName("Should return 200 OK and list of summaries")
        void getMyHouseholds_Success() throws Exception {
            var summary = buildSummary(HOUSEHOLD_ID, "My Apt");
            when(householdService.getUserHouseholds(CURRENT_USER_ID)).thenReturn(List.of(summary));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].householdId").value(HOUSEHOLD_ID.toString()))
                    .andExpect(jsonPath("$[0].name").value("My Apt"));

            verify(householdService).getUserHouseholds(CURRENT_USER_ID);
        }
    }

    // ==========================================
    // 3. GET /api/households/{householdId} (DETAIL)
    // ==========================================
    @Nested
    @DisplayName("GET /api/households/{householdId}")
    class GetHouseholdDetailTests {

        @Test
        @DisplayName("Should return 200 OK and household detail with members")
        void getHousehold_Success() throws Exception {
            var member = new HouseholdResponse.MemberSummary(TARGET_USER_ID, "Alex", "alex@test.com", HouseholdRole.ADMIN, "Roomie", Instant.now());
            var detail = new HouseholdResponse.Detail(HOUSEHOLD_ID, "My Apt", "Desc", null, MAD, CASABLANCA, 5, false, List.of(member), Instant.now());

            when(householdService.getHousehold(HOUSEHOLD_ID)).thenReturn(detail);

            mockMvc.perform(get(BASE_URL + "/{householdId}", HOUSEHOLD_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.householdId").value(HOUSEHOLD_ID.toString()))
                    .andExpect(jsonPath("$.members[0].userId").value(TARGET_USER_ID.toString()))
                    .andExpect(jsonPath("$.members[0].username").value("Alex"));

            verify(householdService).getHousehold(HOUSEHOLD_ID);
        }
    }

    // ==========================================
    // 4. PUT /api/households/{householdId} (UPDATE)
    // ==========================================
    @Nested
    @DisplayName("PUT /api/households/{householdId}")
    class UpdateHouseholdTests {

        @Test
        @DisplayName("Should return 200 OK and updated Summary when valid")
        void update_Success() throws Exception {
            var request = new HouseholdRequest.Update("Updated Apt", "New Desc", null, MAD, CASABLANCA, 8);
            var summary = buildSummary(HOUSEHOLD_ID, "Updated Apt");

            when(householdService.update(eq(HOUSEHOLD_ID), any())).thenReturn(summary);

            mockMvc.perform(put(BASE_URL + "/{householdId}", HOUSEHOLD_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Apt"));

            verify(householdService).update(eq(HOUSEHOLD_ID), any());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when maxMembers is less than 1")
        void update_InvalidCapacity_ReturnsBadRequest() throws Exception {
            var invalidRequest = new HouseholdRequest.Update("Valid Name", null, null, null, null, 0);

            mockMvc.perform(put(BASE_URL + "/{householdId}", HOUSEHOLD_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 5. DELETE /api/households/{householdId} (ARCHIVE)
    // ==========================================
    @Nested
    @DisplayName("DELETE /api/households/{householdId}")
    class ArchiveHouseholdTests {

        @Test
        @DisplayName("Should return 204 No Content when archived")
        void archive_Success() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{householdId}", HOUSEHOLD_ID))
                    .andExpect(status().isNoContent());

            verify(householdService).archive(HOUSEHOLD_ID);
        }
    }

    // ==========================================
    // 6. PUT /api/households/{householdId}/members/{targetUserId} (UPDATE MEMBER)
    // ==========================================
    @Nested
    @DisplayName("PUT /api/households/{householdId}/members/{targetUserId}")
    class UpdateMemberTests {

        @Test
        @DisplayName("Should return 200 OK and updated MemberSummary")
        void updateMember_Success() throws Exception {
            var request = new HouseholdRequest.UpdateMember(HouseholdRole.MEMBER, "NewAlias");
            var summary = new HouseholdResponse.MemberSummary(TARGET_USER_ID, "Alex", "alex@test.com", HouseholdRole.MEMBER, "NewAlias", Instant.now());

            when(householdService.updateMember(eq(HOUSEHOLD_ID), eq(TARGET_USER_ID), any())).thenReturn(summary);

            mockMvc.perform(put(BASE_URL + "/{householdId}/members/{targetUserId}", HOUSEHOLD_ID, TARGET_USER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nickname").value("NewAlias"))
                    .andExpect(jsonPath("$.role").value("MEMBER"));

            verify(householdService).updateMember(eq(HOUSEHOLD_ID), eq(TARGET_USER_ID), any());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when role is null")
        void updateMember_NullRole_ReturnsBadRequest() throws Exception {
            var invalidRequest = new HouseholdRequest.UpdateMember(null, "Alias");

            mockMvc.perform(put(BASE_URL + "/{householdId}/members/{targetUserId}", HOUSEHOLD_ID, TARGET_USER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 7. DELETE /api/households/{householdId}/members/{targetUserId} (REMOVE MEMBER)
    // ==========================================
    @Nested
    @DisplayName("DELETE /api/households/{householdId}/members/{targetUserId}")
    class RemoveMemberTests {

        @Test
        @DisplayName("Should return 204 No Content when member is removed")
        void removeMember_Success() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{householdId}/members/{targetUserId}", HOUSEHOLD_ID, TARGET_USER_ID))
                    .andExpect(status().isNoContent());

            verify(householdService).removeMember(HOUSEHOLD_ID, TARGET_USER_ID);
        }
    }
}
