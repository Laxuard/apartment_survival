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
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.service.InvitationService;
import com.apartment.survival.iam.security.UserDetailsImpl;

@WebMvcTest(controllers = UserInboxInviteController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("UserInboxInviteController Slice Tests")
class UserInboxInviteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InvitationService invitationService;

    @MockitoBean
    private ExceptionTranslator exceptionTranslator;

    private static final UUID CURRENT_USER_ID = UUID.randomUUID();
    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID INVITE_ID = UUID.randomUUID();

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

    // ==========================================
    // 1. POST /api/households/join
    // ==========================================
    @Nested
    @DisplayName("POST /api/households/join")
    class JoinWithCodeTests {

        @Test
        @DisplayName("Should return 200 OK and summary when valid join code is supplied")
        void joinWithCode_Success() throws Exception {
            var request = new InviteRequest.JoinWithCode("ABCD-2345");
            var summary = new HouseholdResponse.Summary(
                    HOUSEHOLD_ID, "Sunshine Villa", "Beach Apt", null, Currency.getInstance("MAD"), null, 2, false, Instant.now()
            );

            when(invitationService.joinViaCode(any(InviteRequest.JoinWithCode.class), eq(CURRENT_USER_ID)))
                    .thenReturn(summary);

            mockMvc.perform(post("/api/households/join")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.householdId").value(HOUSEHOLD_ID.toString()))
                    .andExpect(jsonPath("$.name").value("Sunshine Villa"));

            verify(invitationService).joinViaCode(any(InviteRequest.JoinWithCode.class), eq(CURRENT_USER_ID));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when code format is invalid")
        void joinWithCode_InvalidFormat_ReturnsBadRequest() throws Exception {
            var request = new InviteRequest.JoinWithCode("invalid-format-code");

            mockMvc.perform(post("/api/households/join")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==========================================
    // 2. GET /api/me/invites
    // ==========================================
    @Nested
    @DisplayName("GET /api/me/invites")
    class GetMyPendingInvitesTests {

        @Test
        @DisplayName("Should return 200 OK and list of pending invites for the user")
        void getPendingInvites_Success() throws Exception {
            var invite = new InviteResponse.UserInboxInvite(
                    INVITE_ID, HOUSEHOLD_ID, "Sunshine Villa", "Beach Apt", "Alice", Instant.now().plusSeconds(3600), Instant.now()
            );

            when(invitationService.getUserPendingInvites(CURRENT_USER_ID)).thenReturn(List.of(invite));

            mockMvc.perform(get("/api/me/invites"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].inviteId").value(INVITE_ID.toString()))
                    .andExpect(jsonPath("$[0].householdName").value("Sunshine Villa"))
                    .andExpect(jsonPath("$[0].invitedByUsername").value("Alice"));

            verify(invitationService).getUserPendingInvites(CURRENT_USER_ID);
        }
    }

    // ==========================================
    // 3. POST /api/me/invites/{inviteId}/accept
    // ==========================================
    @Nested
    @DisplayName("POST /api/me/invites/{inviteId}/accept")
    class AcceptInviteTests {

        @Test
        @DisplayName("Should return 200 OK and household summary when invite is accepted")
        void acceptInvite_Success() throws Exception {
            var summary = new HouseholdResponse.Summary(
                    HOUSEHOLD_ID, "Sunshine Villa", "Beach Apt", null, Currency.getInstance("MAD"), null, 2, false, Instant.now()
            );

            when(invitationService.acceptDirectInvite(INVITE_ID, CURRENT_USER_ID)).thenReturn(summary);

            mockMvc.perform(post("/api/me/invites/{inviteId}/accept", INVITE_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.householdId").value(HOUSEHOLD_ID.toString()));

            verify(invitationService).acceptDirectInvite(INVITE_ID, CURRENT_USER_ID);
        }
    }

    // ==========================================
    // 4. POST /api/me/invites/{inviteId}/decline
    // ==========================================
    @Nested
    @DisplayName("POST /api/me/invites/{inviteId}/decline")
    class DeclineInviteTests {

        @Test
        @DisplayName("Should return 204 No Content when invite is declined")
        void declineInvite_Success() throws Exception {
            mockMvc.perform(post("/api/me/invites/{inviteId}/decline", INVITE_ID))
                    .andExpect(status().isNoContent());

            verify(invitationService).declineDirectInvite(INVITE_ID, CURRENT_USER_ID);
        }
    }
}
