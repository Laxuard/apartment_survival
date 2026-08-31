package com.apartment.survival.household.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Currency;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.model.HouseholdRole;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HouseholdMapper Unit Tests")
class HouseholdMapperTest {

    private final HouseholdMapper mapper = Mappers.getMapper(HouseholdMapper.class);

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final Currency MAD = Currency.getInstance("MAD");
    private static final ZoneId CASABLANCA = ZoneId.of("Africa/Casablanca");

    @Nested
    @DisplayName("toSummary()")
    class ToSummaryTests {

        @Test
        @DisplayName("Should map Household entity to Summary DTO and compute member count")
        void toSummary_Success() {
            HouseholdMember member = HouseholdMember.builder().userId(USER_ID).role(HouseholdRole.ADMIN).build();
            Household household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .name("Apt")
                    .description("Desc")
                    .avatarUrl("http://avatar.png")
                    .currency(MAD)
                    .timezone(CASABLANCA)
                    .archived(false)
                    .members(Set.of(member))
                    .createdAt(Instant.now())
                    .build();

            HouseholdResponse.Summary summary = mapper.toSummary(household);

            assertThat(summary).isNotNull();
            assertThat(summary.householdId()).isEqualTo(HOUSEHOLD_ID);
            assertThat(summary.name()).isEqualTo("Apt");
            assertThat(summary.description()).isEqualTo("Desc");
            assertThat(summary.avatarUrl()).isEqualTo("http://avatar.png");
            assertThat(summary.currency()).isEqualTo(MAD);
            assertThat(summary.timezone()).isEqualTo(CASABLANCA);
            assertThat(summary.memberCount()).isEqualTo(1);
            assertThat(summary.archived()).isFalse();
        }

        @Test
        @DisplayName("Should handle null members collection gracefully with member count 0")
        void toSummary_NullMembers() {
            Household household = Household.builder().id(HOUSEHOLD_ID).name("Apt").members(null).build();
            HouseholdResponse.Summary summary = mapper.toSummary(household);

            assertThat(summary.memberCount()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("toDetail()")
    class ToDetailTests {

        @Test
        @DisplayName("Should map Household and hydrated members list to Detail DTO")
        void toDetail_Success() {
            Household household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .name("Apt")
                    .maxMembers(5)
                    .currency(MAD)
                    .timezone(CASABLANCA)
                    .build();

            HouseholdResponse.MemberSummary memberSummary = new HouseholdResponse.MemberSummary(
                    USER_ID, "Alex", "alex@test.com", HouseholdRole.ADMIN, "Alias", Instant.now());

            HouseholdResponse.Detail detail = mapper.toDetail(household, List.of(memberSummary));

            assertThat(detail).isNotNull();
            assertThat(detail.householdId()).isEqualTo(HOUSEHOLD_ID);
            assertThat(detail.name()).isEqualTo("Apt");
            assertThat(detail.maxMembers()).isEqualTo(5);
            assertThat(detail.members()).containsExactly(memberSummary);
        }
    }

    @Nested
    @DisplayName("toMemberSummary()")
    class ToMemberSummaryTests {

        @Test
        @DisplayName("Should map HouseholdMember and IAM profile data to MemberSummary DTO")
        void toMemberSummary_Success() {
            HouseholdMember member = HouseholdMember.builder()
                    .userId(USER_ID)
                    .role(HouseholdRole.MEMBER)
                    .nickname("Roomie")
                    .createdAt(Instant.now())
                    .build();

            HouseholdResponse.MemberSummary summary = mapper.toMemberSummary(member, "Alex", "alex@test.com");

            assertThat(summary).isNotNull();
            assertThat(summary.userId()).isEqualTo(USER_ID);
            assertThat(summary.username()).isEqualTo("Alex");
            assertThat(summary.email()).isEqualTo("alex@test.com");
            assertThat(summary.role()).isEqualTo(HouseholdRole.MEMBER);
            assertThat(summary.nickname()).isEqualTo("Roomie");
            assertThat(summary.joinedAt()).isEqualTo(member.getCreatedAt());
        }
    }

    @Nested
    @DisplayName("toEntity()")
    class ToEntityTests {

        @Test
        @DisplayName("Should map Create DTO to Household entity with archived set to false")
        void toEntity_Success() {
            HouseholdRequest.Create request = new HouseholdRequest.Create("New Apt", "Desc", MAD, CASABLANCA);
            Household entity = mapper.toEntity(request);

            assertThat(entity).isNotNull();
            assertThat(entity.getName()).isEqualTo("New Apt");
            assertThat(entity.getDescription()).isEqualTo("Desc");
            assertThat(entity.getCurrency()).isEqualTo(MAD);
            assertThat(entity.getTimezone()).isEqualTo(CASABLANCA);
            assertThat(entity.isArchived()).isFalse();
            assertThat(entity.getId()).isNull();
        }

        @Test
        @DisplayName("Should apply default currency (MAD) and timezone (Africa/Casablanca) when null in Create request")
        void toEntity_NullCurrencyAndTimezone_AppliesDefaults() {
            HouseholdRequest.Create request = new HouseholdRequest.Create("New Apt", null, null, null);
            Household entity = mapper.toEntity(request);

            assertThat(entity).isNotNull();
            assertThat(entity.getCurrency()).isEqualTo(MAD);
            assertThat(entity.getTimezone()).isEqualTo(CASABLANCA);
        }
    }

    @Nested
    @DisplayName("updateEntity()")
    class UpdateEntityTests {

        @Test
        @DisplayName("Should update non-null properties on existing Household entity")
        void updateEntity_Success() {
            Household household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .name("Old Name")
                    .description("Old Desc")
                    .maxMembers(4)
                    .currency(MAD)
                    .build();

            HouseholdRequest.Update request = new HouseholdRequest.Update("Updated Name", null, null, null, null, 10);
            mapper.updateEntity(request, household);

            assertThat(household.getName()).isEqualTo("Updated Name");
            assertThat(household.getMaxMembers()).isEqualTo(10);
            assertThat(household.getDescription()).isEqualTo("Old Desc"); // Preserved because request description is
                                                                          // null
            assertThat(household.getCurrency()).isEqualTo(MAD);
        }
    }

    @Nested
    @DisplayName("Invite Mappings")
    class InviteMappingTests {

        @Test
        @DisplayName("Should map HouseholdInvite to HouseholdInviteSummary DTO")
        void toInviteSummary_Success() {
            var invite = com.apartment.survival.household.model.HouseholdInvite.builder()
                    .id(UUID.randomUUID())
                    .type(com.apartment.survival.household.model.InviteType.DIRECT_USER)
                    .status(com.apartment.survival.household.model.InviteStatus.PENDING)
                    .code(null)
                    .maxUses(1)
                    .usedCount(0)
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .createdAt(Instant.now())
                    .build();

            var summary = mapper.toInviteSummary(invite, "Bob");

            assertThat(summary).isNotNull();
            assertThat(summary.inviteId()).isEqualTo(invite.getId());
            assertThat(summary.type()).isEqualTo(invite.getType());
            assertThat(summary.status()).isEqualTo(invite.getStatus());
            assertThat(summary.targetUsername()).isEqualTo("Bob");
            assertThat(summary.maxUses()).isEqualTo(1);
            assertThat(summary.usedCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should map HouseholdInvite to UserInboxInvite DTO")
        void toInboxInvite_Success() {
            var household = Household.builder()
                    .id(HOUSEHOLD_ID)
                    .name("Sunshine Villa")
                    .description("Beach Apt")
                    .build();

            var invite = com.apartment.survival.household.model.HouseholdInvite.builder()
                    .id(UUID.randomUUID())
                    .household(household)
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .createdAt(Instant.now())
                    .build();

            var inbox = mapper.toInboxInvite(invite, "Alice");

            assertThat(inbox).isNotNull();
            assertThat(inbox.inviteId()).isEqualTo(invite.getId());
            assertThat(inbox.householdId()).isEqualTo(HOUSEHOLD_ID);
            assertThat(inbox.householdName()).isEqualTo("Sunshine Villa");
            assertThat(inbox.householdDescription()).isEqualTo("Beach Apt");
            assertThat(inbox.invitedByUsername()).isEqualTo("Alice");
        }
    }
}
