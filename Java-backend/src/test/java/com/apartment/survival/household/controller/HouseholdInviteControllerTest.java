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
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.model.InviteStatus;
import com.apartment.survival.household.model.InviteType;
import com.apartment.survival.household.security.HouseholdSecurityEvaluator;
import com.apartment.survival.household.service.InvitationService;
import com.apartment.survival.iam.security.UserDetailsImpl;

@WebMvcTest(controllers = HouseholdInviteController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("HouseholdInviteController Slice Tests")
class HouseholdInviteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InvitationService invitationService;

    @MockitoBean
    private HouseholdSecurityEvaluator householdSecurity;

    @MockitoBean
    private ExceptionTranslator exceptionTranslator;

    private static final UUID CURRENT_USER_ID = UUID.randomUUID();
    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID INVITE_ID = UUID.randomUUID();
    private static final String BASE_URL = "/api/households/" + HOUSEHOLD_ID + "/invites";

    private static final UserDetailsImpl CURRENT_USER = new UserDetailsImpl(
            CURRENT_USER_ID, "user@test.com", "AdminUser", "password", true, true, List.of()
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

    // ==========================================
    // 1. POST /api/households/{id}/invites/link
    // ==========================================
    @Nested
    @DisplayName("POST /api/households/{householdId}/invites/link")
    class CreateLinkInviteTests {

        @Test
        @DisplayName("Should return 201 Created and HouseholdInviteSummary when request is valid")
        void createLink_Success() throws Exception {
            var request = new InviteRequest.CreateLink(5, 14);
            var summary = new InviteResponse.HouseholdInviteSummary(
                    INVITE_ID, InviteType.LINK, InviteStatus.PENDING, "ABCD-2345", null, 5, 0, Instant.now().plusSeconds(3600), Instant.now()
            );

            when(invitationService.createLinkInvite(eq(HOUSEHOLD_ID), any(InviteRequest.CreateLink.class), eq(CURRENT_USER_ID)))
                    .thenReturn(summary);

            mockMvc.perform(post(BASE_URL + "/link")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.inviteId").value(INVITE_ID.toString()))
                    .andExpect(jsonPath("$.type").value("LINK"))
                    .andExpect(jsonPath("$.code").value("ABCD-2345"))
                    .andExpect(jsonPath("$.maxUses").value(5));

            verify(invitationService).createLinkInvite(eq(HOUSEHOLD_ID), any(InviteRequest.CreateLink.class), eq(CURRENT_USER_ID));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when maxUses is less than 1")
        void createLink_InvalidMaxUses_ReturnsBadRequest() throws Exception {
            var request = new InviteRequest.CreateLink(0, 14);

            mockMvc.perform(post(BASE_URL + "/link")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 2. POST /api/households/{id}/invites/direct
    // ==========================================
    @Nested
    @DisplayName("POST /api/households/{householdId}/invites/direct")
    class CreateDirectInviteTests {

        @Test
        @DisplayName("Should return 201 Created and summary when request is valid")
        void createDirect_Success() throws Exception {
            var request = new InviteRequest.CreateDirect("Bob", 7);
            var summary = new InviteResponse.HouseholdInviteSummary(
                    INVITE_ID, InviteType.DIRECT_USER, InviteStatus.PENDING, null, "Bob", 1, 0, Instant.now().plusSeconds(3600), Instant.now()
            );

            when(invitationService.createDirectInvite(eq(HOUSEHOLD_ID), any(InviteRequest.CreateDirect.class), eq(CURRENT_USER_ID)))
                    .thenReturn(summary);

            mockMvc.perform(post(BASE_URL + "/direct")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.inviteId").value(INVITE_ID.toString()))
                    .andExpect(jsonPath("$.type").value("DIRECT_USER"))
                    .andExpect(jsonPath("$.targetUsername").value("Bob"));

            verify(invitationService).createDirectInvite(eq(HOUSEHOLD_ID), any(InviteRequest.CreateDirect.class), eq(CURRENT_USER_ID));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when username is blank")
        void createDirect_BlankUsername_ReturnsBadRequest() throws Exception {
            var request = new InviteRequest.CreateDirect("", 7);

            mockMvc.perform(post(BASE_URL + "/direct")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 3. GET /api/households/{id}/invites
    // ==========================================
    @Nested
    @DisplayName("GET /api/households/{householdId}/invites")
    class GetHouseholdInvitesTests {

        @Test
        @DisplayName("Should return 200 OK and list of invites")
        void getHouseholdInvites_Success() throws Exception {
            var summary = new InviteResponse.HouseholdInviteSummary(
                    INVITE_ID, InviteType.LINK, InviteStatus.PENDING, "ABCD-2345", null, 5, 0, Instant.now().plusSeconds(3600), Instant.now()
            );

            when(invitationService.getHouseholdInvites(HOUSEHOLD_ID)).thenReturn(List.of(summary));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].inviteId").value(INVITE_ID.toString()))
                    .andExpect(jsonPath("$[0].type").value("LINK"));

            verify(invitationService).getHouseholdInvites(HOUSEHOLD_ID);
        }
    }

    // ==========================================
    // 4. DELETE /api/households/{id}/invites/{inviteId}
    // ==========================================
    @Nested
    @DisplayName("DELETE /api/households/{householdId}/invites/{inviteId}")
    class RevokeInviteTests {

        @Test
        @DisplayName("Should return 204 No Content when invite is revoked")
        void revokeInvite_Success() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{inviteId}", INVITE_ID))
                    .andExpect(status().isNoContent());

            verify(invitationService).revokeInvite(HOUSEHOLD_ID, INVITE_ID);
        }
    }
}
