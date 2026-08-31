package com.apartment.survival.household.service;

import java.time.Instant;
import java.time.ZoneId;
import java.util.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.mapper.HouseholdMapper;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("HouseholdService Unit Tests")
class HouseholdServiceTest {

    @Mock
    private UserPublicApi userPublicApi;
    @Mock
    private HouseholdMapper householdMapper;
    @Mock
    private HouseholdRepository householdRepository;
    @Mock
    private HouseholdMemberRepository memberRepository;

    @InjectMocks
    private HouseholdService householdService;

    // === Shared Fixtures ===
    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID CREATOR_ID = UUID.randomUUID();
    private static final UUID TARGET_USER_ID = UUID.randomUUID();
    private static final String NAME = "Cozy Apartment";
    private static final Currency MAD = Currency.getInstance("MAD");
    private static final ZoneId CASABLANCA = ZoneId.of("Africa/Casablanca");

    private Household buildHousehold(UUID id, String name, int maxMembers) {
        return Household.builder()
                .id(id).name(name).maxMembers(maxMembers)
                .currency(MAD).timezone(CASABLANCA)
                .members(new HashSet<>()).build();
    }

    private HouseholdMember buildMember(UUID userId, HouseholdRole role, String nickname) {
        return HouseholdMember.builder()
                .id(UUID.randomUUID()).userId(userId).role(role).nickname(nickname).build();
    }

    private HouseholdResponse.Summary buildSummary(UUID id, String name) {
        return new HouseholdResponse.Summary(id, name, null, null, MAD, CASABLANCA, 1, false, Instant.now());
    }

    // ==========================================
    // 1. CREATE
    // ==========================================
    @Nested
    @DisplayName("create()")
    class CreateTests {

        @Test
        @DisplayName("Should create household with default currency/timezone and assign creator as ADMIN")
        void create_Success() {
            var request = new HouseholdRequest.Create(NAME, "Desc", null, null);
            var mapped = buildHousehold(null, NAME, 10);
            var saved = buildHousehold(HOUSEHOLD_ID, NAME, 10);
            var summary = buildSummary(HOUSEHOLD_ID, NAME);

            when(userPublicApi.existsById(CREATOR_ID)).thenReturn(true);
            when(householdMapper.toEntity(request)).thenReturn(mapped);
            when(householdRepository.save(mapped)).thenReturn(saved);
            when(householdMapper.toSummary(saved, HouseholdRole.ADMIN)).thenReturn(summary);

            var result = householdService.create(request, CREATOR_ID);

            assertThat(result).isEqualTo(summary);
            assertThat(mapped.getMembers()).hasSize(1);
            assertThat(mapped.getMembers().iterator().next().getRole()).isEqualTo(HouseholdRole.ADMIN);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when creator does not exist in IAM")
        void create_UserNotFound() {
            var request = new HouseholdRequest.Create(NAME, null, null, null);
            when(userPublicApi.existsById(CREATOR_ID)).thenReturn(false);

            assertThatThrownBy(() -> householdService.create(request, CREATOR_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
            verifyNoInteractions(householdRepository);
        }
    }

    // ==========================================
    // 2. GET USER HOUSEHOLDS
    // ==========================================
    @Nested
    @DisplayName("getUserHouseholds()")
    class GetUserHouseholdsTests {

        @Test
        @DisplayName("Should return summaries of all active households for user")
        void getUserHouseholds_Success() {
            var h1 = buildHousehold(UUID.randomUUID(), "Apt 1", 5);
            var member = buildMember(CREATOR_ID, HouseholdRole.ADMIN, null);
            h1.addMember(member);
            var s1 = buildSummary(h1.getId(), "Apt 1");

            when(householdRepository.findAllActiveByUser(CREATOR_ID)).thenReturn(List.of(h1));
            when(householdMapper.toSummary(eq(h1), any())).thenReturn(s1);

            assertThat(householdService.getUserHouseholds(CREATOR_ID)).containsExactly(s1);
        }

        @Test
        @DisplayName("Should return empty list when user has no active households")
        void getUserHouseholds_Empty() {
            when(householdRepository.findAllActiveByUser(CREATOR_ID)).thenReturn(List.of());
            assertThat(householdService.getUserHouseholds(CREATOR_ID)).isEmpty();
        }
    }

    // ==========================================
    // 3. GET HOUSEHOLD DETAIL
    // ==========================================
    @Nested
    @DisplayName("getHousehold()")
    class GetHouseholdTests {

        @Test
        @DisplayName("Should batch hydrate user profiles and return detail")
        void getHousehold_Success() {
            var member = buildMember(TARGET_USER_ID, HouseholdRole.ADMIN, "Roomie");
            var household = buildHousehold(HOUSEHOLD_ID, NAME, 5);
            household.addMember(member);

            var profile = new UserPublicDto(TARGET_USER_ID, "Alex", "alex@gmail.com");
            var memberSummary = new HouseholdResponse.MemberSummary(TARGET_USER_ID, "Alex", "alex@gmail.com",
                    HouseholdRole.ADMIN, "Roomie", Instant.now());
            var detail = new HouseholdResponse.Detail(HOUSEHOLD_ID, NAME, null, null, MAD, CASABLANCA, 5, false,
                    List.of(memberSummary), Instant.now());

            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(userPublicApi.findAllByIds(Set.of(TARGET_USER_ID))).thenReturn(Map.of(TARGET_USER_ID, profile));
            when(householdMapper.toMemberSummary(member, "Alex", "alex@gmail.com")).thenReturn(memberSummary);
            when(householdMapper.toDetail(eq(household), any(), any())).thenReturn(detail);

            assertThat(householdService.getHousehold(HOUSEHOLD_ID)).isEqualTo(detail);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when household does not exist")
        void getHousehold_NotFound() {
            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> householdService.getHousehold(HOUSEHOLD_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ==========================================
    // 4. UPDATE HOUSEHOLD
    // ==========================================
    @Nested
    @DisplayName("update()")
    class UpdateTests {

        @Test
        @DisplayName("Should update settings when requested max capacity is valid")
        void update_Success() {
            var request = new HouseholdRequest.Update("New Name", null, null, null, null, 6);
            var household = buildHousehold(HOUSEHOLD_ID, NAME, 4);
            var summary = buildSummary(HOUSEHOLD_ID, "New Name");

            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(2L);
            when(householdMapper.toSummary(eq(household), any())).thenReturn(summary);

            assertThat(householdService.update(HOUSEHOLD_ID, request)).isEqualTo(summary);
            verify(householdMapper).updateEntity(request, household);
        }

        @Test
        @DisplayName("Should throw BadRequestException when capacity is lower than current members count")
        void update_CapacityTooLow() {
            var request = new HouseholdRequest.Update("New Name", null, null, null, null, 2);
            var household = buildHousehold(HOUSEHOLD_ID, NAME, 4);

            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(memberRepository.countByHouseholdId(HOUSEHOLD_ID)).thenReturn(4L);

            assertThatThrownBy(() -> householdService.update(HOUSEHOLD_ID, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("cannot be lower than current member count");
        }
    }

    // ==========================================
    // 5. ARCHIVE HOUSEHOLD
    // ==========================================
    @Nested
    @DisplayName("archive()")
    class ArchiveTests {

        @Test
        @DisplayName("Should mark household as archived")
        void archive_Success() {
            var household = buildHousehold(HOUSEHOLD_ID, NAME, 5);
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));

            householdService.archive(HOUSEHOLD_ID);
            assertThat(household.isArchived()).isTrue();
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when household does not exist")
        void archive_NotFound() {
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> householdService.archive(HOUSEHOLD_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ==========================================
    // 6. UPDATE MEMBER
    // ==========================================
    @Nested
    @DisplayName("updateMember()")
    class UpdateMemberTests {

        @Test
        @DisplayName("Should update role and trimmed nickname")
        void updateMember_Success() {
            var request = new HouseholdRequest.UpdateMember(HouseholdRole.MEMBER, "  Alias  ");
            var member = buildMember(TARGET_USER_ID, HouseholdRole.ADMIN, "Old");
            var profile = new UserPublicDto(TARGET_USER_ID, "Sam", "sam@gmail.com");
            var summary = new HouseholdResponse.MemberSummary(TARGET_USER_ID, "Sam", "sam@gmail.com",
                    HouseholdRole.MEMBER, "Alias", Instant.now());

            when(memberRepository.findByActiveHouseholdIdAndUserId(HOUSEHOLD_ID, TARGET_USER_ID))
                    .thenReturn(Optional.of(member));
            when(memberRepository.countByHouseholdIdAndRole(HOUSEHOLD_ID, HouseholdRole.ADMIN)).thenReturn(2L);
            when(userPublicApi.findById(TARGET_USER_ID)).thenReturn(Optional.of(profile));
            when(householdMapper.toMemberSummary(member, "Sam", "sam@gmail.com")).thenReturn(summary);

            assertThat(householdService.updateMember(HOUSEHOLD_ID, TARGET_USER_ID, request)).isEqualTo(summary);
            assertThat(member.getNickname()).isEqualTo("Alias");
        }

        @Test
        @DisplayName("Should throw BadRequestException when attempting to demote the sole ADMIN")
        void updateMember_DemoteSoleAdmin_ThrowsBadRequest() {
            var request = new HouseholdRequest.UpdateMember(HouseholdRole.MEMBER, null);
            var soleAdmin = buildMember(TARGET_USER_ID, HouseholdRole.ADMIN, null);

            when(memberRepository.findByActiveHouseholdIdAndUserId(HOUSEHOLD_ID, TARGET_USER_ID))
                    .thenReturn(Optional.of(soleAdmin));
            when(memberRepository.countByHouseholdIdAndRole(HOUSEHOLD_ID, HouseholdRole.ADMIN)).thenReturn(1L);

            assertThatThrownBy(() -> householdService.updateMember(HOUSEHOLD_ID, TARGET_USER_ID, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot demote the sole admin");
        }
    }

    // ==========================================
    // 7. REMOVE MEMBER
    // ==========================================
    @Nested
    @DisplayName("removeMember()")
    class RemoveMemberTests {

        @Test
        @DisplayName("Should successfully remove regular member")
        void removeMember_RegularMember_Success() {
            var household = buildHousehold(HOUSEHOLD_ID, NAME, 5);
            var member = buildMember(TARGET_USER_ID, HouseholdRole.MEMBER, null);
            household.addMember(member);

            when(memberRepository.findByActiveHouseholdIdAndUserId(HOUSEHOLD_ID, TARGET_USER_ID))
                    .thenReturn(Optional.of(member));

            householdService.removeMember(HOUSEHOLD_ID, TARGET_USER_ID);

            assertThat(household.getMembers()).doesNotContain(member);
            verify(memberRepository).delete(member);
        }

        @Test
        @DisplayName("Should throw BadRequestException when attempting to remove or leave as the sole ADMIN")
        void removeMember_SoleAdmin_ThrowsBadRequest() {
            var member = buildMember(TARGET_USER_ID, HouseholdRole.ADMIN, null);

            when(memberRepository.findByActiveHouseholdIdAndUserId(HOUSEHOLD_ID, TARGET_USER_ID))
                    .thenReturn(Optional.of(member));
            when(memberRepository.countByHouseholdIdAndRole(HOUSEHOLD_ID, HouseholdRole.ADMIN)).thenReturn(1L);

            assertThatThrownBy(() -> householdService.removeMember(HOUSEHOLD_ID, TARGET_USER_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot leave or remove the sole admin");

            verify(memberRepository, never()).delete(any());
        }
    }
}
