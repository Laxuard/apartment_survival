package com.apartment.survival.household;

import java.util.UUID;

import jakarta.servlet.http.HttpSession;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.repository.HouseholdInviteRepository;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.dto.AuthRequest;
import com.apartment.survival.iam.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Household Invitation E2E Integration Tests")
class HouseholdInviteIntegrationTest {

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
        private HouseholdInviteRepository inviteRepository;

        @BeforeEach
        void cleanDatabase() {
                inviteRepository.deleteAll();
                memberRepository.deleteAll();
                householdRepository.deleteAll();
                userRepository.deleteAll();
        }

        private HttpSession registerUser(String username, String email) throws Exception {
                var registerRequest = new AuthRequest.Register(email, username, "StrongP@ss123");
                MvcResult result = mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerRequest)))
                                .andExpect(status().isCreated())
                                .andReturn();
                return result.getRequest().getSession(false);
        }

        private UUID createHousehold(HttpSession session, String name) throws Exception {
                var createRequest = new HouseholdRequest.Create(name, "Nice place", null, null);
                MvcResult result = mockMvc.perform(post("/api/households")
                                .session((org.springframework.mock.web.MockHttpSession) session)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn();

                HouseholdResponse.Summary summary = objectMapper.readValue(
                                result.getResponse().getContentAsString(), HouseholdResponse.Summary.class);
                return summary.householdId();
        }

        @Test
        @DisplayName("Complete Flow: Shareable code invite creation and successful join")
        void linkInvite_CreateAndJoinFlow() throws Exception {
                HttpSession aliceSession = registerUser("alice", "alice@example.com");
                HttpSession bobSession = registerUser("bob", "bob@example.com");
                UUID householdId = createHousehold(aliceSession, "Sunshine Villa");

                // 1. Alice creates shareable link
                var linkRequest = new InviteRequest.CreateLink(5, 7);
                MvcResult linkResult = mockMvc.perform(post("/api/households/" + householdId + "/invites/link")
                                .session((org.springframework.mock.web.MockHttpSession) aliceSession)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(linkRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.code").isNotEmpty())
                                .andReturn();

                InviteResponse.HouseholdInviteSummary invite = objectMapper.readValue(
                                linkResult.getResponse().getContentAsString(),
                                InviteResponse.HouseholdInviteSummary.class);
                String code = invite.code();

                // 2. Bob joins with the code
                var joinRequest = new InviteRequest.JoinWithCode(code);
                mockMvc.perform(post("/api/households/join")
                                .session((org.springframework.mock.web.MockHttpSession) bobSession)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(joinRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.householdId").value(householdId.toString()))
                                .andExpect(jsonPath("$.name").value("Sunshine Villa"));

                // 3. Verify Bob is now a member
                mockMvc.perform(get("/api/households/" + householdId)
                                .session((org.springframework.mock.web.MockHttpSession) bobSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.members.length()").value(2));
        }

        @Test
        @DisplayName("Complete Flow: Direct username invite, inbox pull, and acceptance")
        void directInvite_SendInboxAcceptFlow() throws Exception {
                HttpSession aliceSession = registerUser("alice", "alice@example.com");
                HttpSession charlieSession = registerUser("charlie", "charlie@example.com");
                UUID householdId = createHousehold(aliceSession, "Palm Residency");

                // 1. Alice invites Charlie by username
                var directRequest = new InviteRequest.CreateDirect("charlie", 7);
                mockMvc.perform(post("/api/households/" + householdId + "/invites/direct")
                                .session((org.springframework.mock.web.MockHttpSession) aliceSession)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(directRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.targetUsername").value("charlie"));

                // 2. Charlie pulls his inbox
                MvcResult inboxResult = mockMvc.perform(get("/api/me/invites")
                                .session((org.springframework.mock.web.MockHttpSession) charlieSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].householdName").value("Palm Residency"))
                                .andExpect(jsonPath("$[0].invitedByUsername").value("alice"))
                                .andReturn();

                InviteResponse.UserInboxInvite[] inboxInvites = objectMapper.readValue(
                                inboxResult.getResponse().getContentAsString(), InviteResponse.UserInboxInvite[].class);
                UUID inviteId = inboxInvites[0].inviteId();

                // 3. Charlie accepts the invite
                mockMvc.perform(post("/api/me/invites/" + inviteId + "/accept")
                                .session((org.springframework.mock.web.MockHttpSession) charlieSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.householdId").value(householdId.toString()));

                // 4. Charlie's inbox is now empty
                mockMvc.perform(get("/api/me/invites")
                                .session((org.springframework.mock.web.MockHttpSession) charlieSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(0));
        }
}
