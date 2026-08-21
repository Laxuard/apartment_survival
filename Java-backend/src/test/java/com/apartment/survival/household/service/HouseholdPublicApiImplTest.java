package com.apartment.survival.household.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.time.ZoneId;
import java.util.Currency;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.apartment.survival.household.api.HouseholdPublicDto;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("HouseholdPublicApiImpl Unit Tests")
class HouseholdPublicApiImplTest {

    @Mock private HouseholdRepository householdRepository;
    @Mock private HouseholdMemberRepository memberRepository;

    @InjectMocks
    private HouseholdPublicApiImpl householdPublicApi;

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Nested
    @DisplayName("isMember()")
    class IsMemberTests {

        @Test
        @DisplayName("Should return true when repository confirms membership")
        void isMember_True() {
            when(memberRepository.isMember(HOUSEHOLD_ID, USER_ID)).thenReturn(true);
            assertThat(householdPublicApi.isMember(HOUSEHOLD_ID, USER_ID)).isTrue();
        }

        @Test
        @DisplayName("Should return false when arguments are null without querying repository")
        void isMember_NullArgs_ReturnsFalse() {
            assertThat(householdPublicApi.isMember(null, USER_ID)).isFalse();
            assertThat(householdPublicApi.isMember(HOUSEHOLD_ID, null)).isFalse();
            verifyNoInteractions(memberRepository);
        }
    }

    @Nested
    @DisplayName("existsActive()")
    class ExistsActiveTests {

        @Test
        @DisplayName("Should return true when active household exists")
        void existsActive_True() {
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(Household.builder().id(HOUSEHOLD_ID).build()));
            assertThat(householdPublicApi.existsActive(HOUSEHOLD_ID)).isTrue();
        }

        @Test
        @DisplayName("Should return false when null or not found")
        void existsActive_False() {
            assertThat(householdPublicApi.existsActive(null)).isFalse();
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.empty());
            assertThat(householdPublicApi.existsActive(HOUSEHOLD_ID)).isFalse();
        }
    }

    @Nested
    @DisplayName("findById()")
    class FindByIdTests {

        @Test
        @DisplayName("Should map Household to HouseholdPublicDto when active household is found")
        void findById_Success() {
            Household household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .name("Palm Residence")
                    .currency(Currency.getInstance("MAD"))
                    .timezone(ZoneId.of("Africa/Casablanca"))
                    .archived(false)
                    .maxMembers(6)
                    .build();

            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.of(household));

            Optional<HouseholdPublicDto> result = householdPublicApi.findById(HOUSEHOLD_ID);

            assertThat(result).isPresent();
            assertThat(result.get().id()).isEqualTo(HOUSEHOLD_ID);
            assertThat(result.get().name()).isEqualTo("Palm Residence");
            assertThat(result.get().currency()).isEqualTo(Currency.getInstance("MAD"));
            assertThat(result.get().maxMembers()).isEqualTo(6);
        }

        @Test
        @DisplayName("Should return empty when household not found or null")
        void findById_NotFound() {
            assertThat(householdPublicApi.findById(null)).isEmpty();
            when(householdRepository.findActive(HOUSEHOLD_ID)).thenReturn(Optional.empty());
            assertThat(householdPublicApi.findById(HOUSEHOLD_ID)).isEmpty();
        }
    }

    @Nested
    @DisplayName("getActiveMemberUserIds()")
    class GetActiveMemberUserIdsTests {

        @Test
        @DisplayName("Should return set of member userIds when active household with members is found")
        void getActiveMemberUserIds_Success() {
            UUID member1 = UUID.randomUUID();
            UUID member2 = UUID.randomUUID();

            Household household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .members(Set.of(
                            HouseholdMember.builder().userId(member1).build(),
                            HouseholdMember.builder().userId(member2).build()
                    ))
                    .build();

            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.of(household));

            Set<UUID> userIds = householdPublicApi.getActiveMemberUserIds(HOUSEHOLD_ID);

            assertThat(userIds).containsExactlyInAnyOrder(member1, member2);
        }

        @Test
        @DisplayName("Should return empty set when null or not found")
        void getActiveMemberUserIds_Empty() {
            assertThat(householdPublicApi.getActiveMemberUserIds(null)).isEmpty();
            when(householdRepository.findActiveWithMembers(HOUSEHOLD_ID)).thenReturn(Optional.empty());
            assertThat(householdPublicApi.getActiveMemberUserIds(HOUSEHOLD_ID)).isEmpty();
        }
    }
}
