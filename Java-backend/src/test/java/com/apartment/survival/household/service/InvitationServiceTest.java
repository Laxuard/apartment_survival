package com.apartment.survival.household.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.event.HouseholdInviteAcceptedEvent;
import com.apartment.survival.household.event.HouseholdInviteCreatedEvent;
import com.apartment.survival.household.mapper.HouseholdMapper;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdInvite;
import com.apartment.survival.household.model.InviteStatus;
import com.apartment.survival.household.model.InviteType;
import com.apartment.survival.household.repository.HouseholdInviteRepository;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("InvitationService Unit Tests")
class InvitationServiceTest {

    @Mock
    private HouseholdRepository householdRepository;
    @Mock
    private HouseholdMemberRepository memberRepository;
    @Mock
    private HouseholdInviteRepository inviteRepository;
    @Mock
    private UserPublicApi userPublicApi;
    @Mock
    private HouseholdMapper householdMapper;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private InvitationService invitationService;

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID CREATOR_ID = UUID.randomUUID();
    private static final UUID TARGET_USER_ID = UUID.randomUUID();
    private static final UUID INVITE_ID = UUID.randomUUID();
    private static final String CODE = "ABCD-2345";

    private Household buildHousehold(int maxMembers) {
        return Household.builder()
                .id(HOUSEHOLD_ID)
                .name("Sunshine Villa")
                .description("Beach Apt")
                .maxMembers(maxMembers)
                .members(new HashSet<>())
                .archived(false)
                .build();
    }

    private HouseholdInvite buildInvite(InviteType type, InviteStatus status, int maxUses, int usedCount,
            Instant expiresAt) {
        return HouseholdInvite.builder()
                .id(INVITE_ID)
                .household(buildHousehold(5))
                .createdByUserId(CREATOR_ID)
                .type(type)
                .status(status)
                .targetUserId(type == InviteType.DIRECT_USER ? TARGET_USER_ID : null)
                .code(type == InviteType.LINK ? CODE : null)
                .maxUses(maxUses)
                .usedCount(usedCount)
                .expiresAt(expiresAt)
                .build();
    }

    // ==========================================
    // 1. CREATE LINK INVITE
    // ==========================================
    @Nested
    @DisplayName("createLinkInvite()")
    class CreateLinkInviteTests {

        @Test
        @DisplayName("Should generate secure code, save invite, and publish created event")
        void createLink_Success() {
            var household = buildHousehold(5);
            var request = new InviteRequest.CreateLink(5, 14);
            var summary = new InviteResponse.HouseholdInviteSummary(
                    INVITE_ID, InviteType.LINK, InviteStatus.PENDING, CODE, null, 5, 0,
                    Instant.now().plus(14, ChronoUnit.DAYS), Instant.now());

            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(2L);
            when(inviteRepository.findActiveByCode(anyString())).thenReturn(Optional.empty());
            when(inviteRepository.save(any(HouseholdInvite.class))).thenAnswer(invocation -> {
                HouseholdInvite inv = invocation.getArgument(0);
                inv.setId(INVITE_ID);
                return inv;
            });
            when(householdMapper.toInviteSummary(any(HouseholdInvite.class), eq(null))).thenReturn(summary);

            var result = invitationService.createLinkInvite(HOUSEHOLD_ID, request, CREATOR_ID);

            assertThat(result).isEqualTo(summary);
            verify(eventPublisher).publishEvent(any(HouseholdInviteCreatedEvent.class));
            verify(inviteRepository).save(any(HouseholdInvite.class));
        }

        @Test
        @DisplayName("Should throw BadRequestException when household is at maximum capacity")
        void createLink_CapacityReached_ThrowsBadRequest() {
            var household = buildHousehold(3);
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(3L);

            assertThatThrownBy(() -> invitationService.createLinkInvite(HOUSEHOLD_ID,
                    new InviteRequest.CreateLink(null, null), CREATOR_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("maximum member capacity");
        }
    }

    // ==========================================
    // 2. CREATE DIRECT INVITE
    // ==========================================
    @Nested
    @DisplayName("createDirectInvite()")
    class CreateDirectInviteTests {

        @Test
        @DisplayName("Should resolve target user, check membership, save direct invite, and publish event")
        void createDirect_Success() {
            var household = buildHousehold(5);
            var request = new InviteRequest.CreateDirect("Bob", 7);
            var targetDto = new UserPublicDto(TARGET_USER_ID, "Bob", "bob@test.com");
            var summary = new InviteResponse.HouseholdInviteSummary(
                    INVITE_ID, InviteType.DIRECT_USER, InviteStatus.PENDING, null, "Bob", 1, 0,
                    Instant.now().plus(7, ChronoUnit.DAYS), Instant.now());

            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(2L);
            when(userPublicApi.findByUsername("Bob")).thenReturn(Optional.of(targetDto));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(false);
            when(inviteRepository.hasActiveInvite(eq(HOUSEHOLD_ID), eq(TARGET_USER_ID), any(Instant.class)))
                    .thenReturn(false);
            when(inviteRepository.save(any(HouseholdInvite.class))).thenAnswer(inv -> {
                HouseholdInvite saved = inv.getArgument(0);
                saved.setId(INVITE_ID);
                return saved;
            });
            when(householdMapper.toInviteSummary(any(HouseholdInvite.class), eq("Bob"))).thenReturn(summary);

            var result = invitationService.createDirectInvite(HOUSEHOLD_ID, request, CREATOR_ID);

            assertThat(result).isEqualTo(summary);
            verify(eventPublisher).publishEvent(any(HouseholdInviteCreatedEvent.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when username does not exist")
        void createDirect_UserNotFound_ThrowsException() {
            var household = buildHousehold(5);
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(1L);
            when(userPublicApi.findByUsername("NonExistent")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> invitationService.createDirectInvite(HOUSEHOLD_ID,
                    new InviteRequest.CreateDirect("NonExistent", 7), CREATOR_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw BadRequestException when target user is already a member")
        void createDirect_AlreadyMember_ThrowsBadRequest() {
            var household = buildHousehold(5);
            var targetDto = new UserPublicDto(TARGET_USER_ID, "Bob", "bob@test.com");
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(1L);
            when(userPublicApi.findByUsername("Bob")).thenReturn(Optional.of(targetDto));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(true);

            assertThatThrownBy(() -> invitationService.createDirectInvite(HOUSEHOLD_ID,
                    new InviteRequest.CreateDirect("Bob", 7), CREATOR_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("already a member");
        }

        @Test
        @DisplayName("Should throw BadRequestException when pending invite already exists")
        void createDirect_DuplicateInvite_ThrowsBadRequest() {
            var household = buildHousehold(5);
            var targetDto = new UserPublicDto(TARGET_USER_ID, "Bob", "bob@test.com");
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(1L);
            when(userPublicApi.findByUsername("Bob")).thenReturn(Optional.of(targetDto));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(false);
            when(inviteRepository.hasActiveInvite(eq(HOUSEHOLD_ID), eq(TARGET_USER_ID), any(Instant.class)))
                    .thenReturn(true);

            assertThatThrownBy(() -> invitationService.createDirectInvite(HOUSEHOLD_ID,
                    new InviteRequest.CreateDirect("Bob", 7), CREATOR_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("pending invite already exists");
        }
    }

    // ==========================================
    // 3. JOIN VIA CODE
    // ==========================================
    @Nested
    @DisplayName("joinViaCode()")
    class JoinViaCodeTests {

        @Test
        @DisplayName("Should join household via code, add member, increment usage, and publish event")
        void joinViaCode_Success() {
            var invite = buildInvite(InviteType.LINK, InviteStatus.PENDING, 5, 1,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            var request = new InviteRequest.JoinWithCode(CODE);
            var summary = new HouseholdResponse.Summary(HOUSEHOLD_ID, "Sunshine Villa", null, null, null, null, 2,
                    false, Instant.now());

            when(userPublicApi.existsById(TARGET_USER_ID)).thenReturn(true);
            when(inviteRepository.findActiveByCode(CODE)).thenReturn(Optional.of(invite));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(false);
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(1L);
            when(householdMapper.toSummary(invite.getHousehold(),
                    com.apartment.survival.household.model.HouseholdRole.MEMBER)).thenReturn(summary);

            var result = invitationService.joinViaCode(request, TARGET_USER_ID);

            assertThat(result).isEqualTo(summary);
            assertThat(invite.getUsedCount()).isEqualTo(2);
            assertThat(invite.getHousehold().getMembers()).hasSize(1);
            verify(eventPublisher).publishEvent(any(HouseholdInviteAcceptedEvent.class));
        }

        @Test
        @DisplayName("Should throw BadRequestException when code does not exist or is inactive")
        void joinViaCode_InvalidCode_ThrowsBadRequest() {
            when(userPublicApi.existsById(TARGET_USER_ID)).thenReturn(true);
            when(inviteRepository.findActiveByCode(CODE)).thenReturn(Optional.empty());

            assertThatThrownBy(
                    () -> invitationService.joinViaCode(new InviteRequest.JoinWithCode(CODE), TARGET_USER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid or expired");
        }

        @Test
        @DisplayName("Should throw BadRequestException when user is already a member")
        void joinViaCode_AlreadyMember_ThrowsBadRequest() {
            var invite = buildInvite(InviteType.LINK, InviteStatus.PENDING, 5, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            when(userPublicApi.existsById(TARGET_USER_ID)).thenReturn(true);
            when(inviteRepository.findActiveByCode(CODE)).thenReturn(Optional.of(invite));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(true);

            assertThatThrownBy(
                    () -> invitationService.joinViaCode(new InviteRequest.JoinWithCode(CODE), TARGET_USER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("already a member");
        }
    }

    // ==========================================
    // 4. ACCEPT DIRECT INVITE
    // ==========================================
    @Nested
    @DisplayName("acceptDirectInvite()")
    class AcceptDirectInviteTests {

        @Test
        @DisplayName("Should accept direct invite, set status to ACCEPTED, add member, and publish event")
        void acceptDirect_Success() {
            var invite = buildInvite(InviteType.DIRECT_USER, InviteStatus.PENDING, 1, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            var summary = new HouseholdResponse.Summary(HOUSEHOLD_ID, "Sunshine Villa", null, null, null, null, 2,
                    false, Instant.now());

            when(userPublicApi.existsById(TARGET_USER_ID)).thenReturn(true);
            when(inviteRepository.findActiveById(INVITE_ID)).thenReturn(Optional.of(invite));
            when(memberRepository.isMember(HOUSEHOLD_ID, TARGET_USER_ID)).thenReturn(false);
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(1L);
            when(householdMapper.toSummary(invite.getHousehold(),
                    com.apartment.survival.household.model.HouseholdRole.MEMBER)).thenReturn(summary);

            var result = invitationService.acceptDirectInvite(INVITE_ID, TARGET_USER_ID);

            assertThat(result).isEqualTo(summary);
            assertThat(invite.getStatus()).isEqualTo(InviteStatus.ACCEPTED);
            verify(eventPublisher).publishEvent(any(HouseholdInviteAcceptedEvent.class));
        }

        @Test
        @DisplayName("Should throw BadRequestException when user is not the designated target recipient")
        void acceptDirect_UnauthorizedUser_ThrowsBadRequest() {
            var invite = buildInvite(InviteType.DIRECT_USER, InviteStatus.PENDING, 1, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            UUID wrongUser = UUID.randomUUID();

            when(userPublicApi.existsById(wrongUser)).thenReturn(true);
            when(inviteRepository.findActiveById(INVITE_ID)).thenReturn(Optional.of(invite));

            assertThatThrownBy(() -> invitationService.acceptDirectInvite(INVITE_ID, wrongUser))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("not authorized");
        }
    }

    // ==========================================
    // 5. DECLINE DIRECT INVITE
    // ==========================================
    @Nested
    @DisplayName("declineDirectInvite()")
    class DeclineDirectInviteTests {

        @Test
        @DisplayName("Should mark invite as DECLINED when target user declines")
        void declineDirect_Success() {
            var invite = buildInvite(InviteType.DIRECT_USER, InviteStatus.PENDING, 1, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            when(inviteRepository.findActiveById(INVITE_ID)).thenReturn(Optional.of(invite));

            invitationService.declineDirectInvite(INVITE_ID, TARGET_USER_ID);

            assertThat(invite.getStatus()).isEqualTo(InviteStatus.DECLINED);
        }
    }

    // ==========================================
    // 6. REVOKE INVITE
    // ==========================================
    @Nested
    @DisplayName("revokeInvite()")
    class RevokeInviteTests {

        @Test
        @DisplayName("Should mark invite as REVOKED")
        void revokeInvite_Success() {
            var invite = buildInvite(InviteType.LINK, InviteStatus.PENDING, 5, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            when(inviteRepository.findById(INVITE_ID)).thenReturn(Optional.of(invite));

            invitationService.revokeInvite(HOUSEHOLD_ID, INVITE_ID);

            assertThat(invite.getStatus()).isEqualTo(InviteStatus.REVOKED);
        }

        @Test
        @DisplayName("Should throw BadRequestException when invite belongs to different household")
        void revokeInvite_WrongHousehold_ThrowsBadRequest() {
            var invite = buildInvite(InviteType.LINK, InviteStatus.PENDING, 5, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            UUID otherHouseholdId = UUID.randomUUID();
            when(inviteRepository.findById(INVITE_ID)).thenReturn(Optional.of(invite));

            assertThatThrownBy(() -> invitationService.revokeInvite(otherHouseholdId, INVITE_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("does not belong");
        }
    }

    // ==========================================
    // 7. GET USER PENDING INBOX INVITES
    // ==========================================
    @Nested
    @DisplayName("getUserPendingInvites()")
    class GetUserPendingInvitesTests {

        @Test
        @DisplayName("Should batch hydrate inviter profiles and map to UserInboxInvite DTOs")
        void getInbox_Success() {
            var invite = buildInvite(InviteType.DIRECT_USER, InviteStatus.PENDING, 1, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            var inviterDto = new UserPublicDto(CREATOR_ID, "Alice", "alice@test.com");
            var inboxDto = new InviteResponse.UserInboxInvite(INVITE_ID, HOUSEHOLD_ID, "Sunshine Villa", "Beach Apt",
                    "Alice", invite.getExpiresAt(), Instant.now());

            when(inviteRepository.findUserInbox(eq(TARGET_USER_ID), any(Instant.class))).thenReturn(List.of(invite));
            when(userPublicApi.findAllByIds(Set.of(CREATOR_ID))).thenReturn(Map.of(CREATOR_ID, inviterDto));
            when(householdMapper.toInboxInvite(invite, "Alice")).thenReturn(inboxDto);

            var results = invitationService.getUserPendingInvites(TARGET_USER_ID);

            assertThat(results).containsExactly(inboxDto);
        }

        @Test
        @DisplayName("Should return empty list when no pending invites found")
        void getInbox_Empty_ReturnsEmptyList() {
            when(inviteRepository.findUserInbox(eq(TARGET_USER_ID), any(Instant.class))).thenReturn(List.of());

            var results = invitationService.getUserPendingInvites(TARGET_USER_ID);

            assertThat(results).isEmpty();
            verifyNoInteractions(userPublicApi);
        }
    }

    // ==========================================
    // 8. GET ALL HOUSEHOLD INVITES
    // ==========================================
    @Nested
    @DisplayName("getHouseholdInvites()")
    class GetHouseholdInvitesTests {

        @Test
        @DisplayName("Should batch hydrate target usernames and map to HouseholdInviteSummary list")
        void getHouseholdInvites_Success() {
            var linkInvite = buildInvite(InviteType.LINK, InviteStatus.PENDING, 5, 1,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            var directInvite = buildInvite(InviteType.DIRECT_USER, InviteStatus.PENDING, 1, 0,
                    Instant.now().plus(5, ChronoUnit.DAYS));
            var targetDto = new UserPublicDto(TARGET_USER_ID, "Bob", "bob@test.com");

            var summaryLink = new InviteResponse.HouseholdInviteSummary(linkInvite.getId(), InviteType.LINK,
                    InviteStatus.PENDING, CODE, null, 5, 1, linkInvite.getExpiresAt(), Instant.now());
            var summaryDirect = new InviteResponse.HouseholdInviteSummary(directInvite.getId(), InviteType.DIRECT_USER,
                    InviteStatus.PENDING, null, "Bob", 1, 0, directInvite.getExpiresAt(), Instant.now());

            when(inviteRepository.findAllByHousehold(HOUSEHOLD_ID)).thenReturn(List.of(linkInvite, directInvite));
            when(userPublicApi.findAllByIds(Set.of(TARGET_USER_ID))).thenReturn(Map.of(TARGET_USER_ID, targetDto));
            when(householdMapper.toInviteSummary(linkInvite, null)).thenReturn(summaryLink);
            when(householdMapper.toInviteSummary(directInvite, "Bob")).thenReturn(summaryDirect);

            var results = invitationService.getHouseholdInvites(HOUSEHOLD_ID);

            assertThat(results).containsExactly(summaryLink, summaryDirect);
        }
    }
}
