package com.apartment.survival.household.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Household Domain Models Unit Tests")
class HouseholdModelTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Test
    @DisplayName("Should maintain bidirectional relationship when adding/removing members")
    void household_MemberRelationshipManagement() {
        Household household = Household.builder()
                .name("Villa")
                .members(new HashSet<>())
                .build();

        HouseholdMember member = HouseholdMember.builder()
                .userId(USER_ID)
                .role(HouseholdRole.ADMIN)
                .build();

        household.addMember(member);
        assertThat(household.getMembers()).contains(member);
        assertThat(member.getHousehold()).isEqualTo(household);

        household.removeMember(member);
        assertThat(household.getMembers()).doesNotContain(member);
        assertThat(member.getHousehold()).isNull();
    }

    @Test
    @DisplayName("Should correctly evaluate isAdmin() helper on HouseholdMember")
    void member_IsAdmin() {
        HouseholdMember admin = HouseholdMember.builder().userId(USER_ID).role(HouseholdRole.ADMIN).build();
        HouseholdMember regular = HouseholdMember.builder().userId(USER_ID).role(HouseholdRole.MEMBER).build();

        assertThat(admin.isAdmin()).isTrue();
        assertThat(regular.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should correctly evaluate isValid() on HouseholdInvite")
    void invite_IsValid() {
        HouseholdInvite validInvite = HouseholdInvite.builder()
                .type(InviteType.LINK)
                .status(InviteStatus.PENDING)
                .expiresAt(java.time.Instant.now().plusSeconds(3600))
                .maxUses(5)
                .usedCount(2)
                .build();

        HouseholdInvite expiredInvite = HouseholdInvite.builder()
                .type(InviteType.LINK)
                .status(InviteStatus.PENDING)
                .expiresAt(java.time.Instant.now().minusSeconds(3600))
                .build();

        HouseholdInvite maxedInvite = HouseholdInvite.builder()
                .type(InviteType.LINK)
                .status(InviteStatus.PENDING)
                .expiresAt(java.time.Instant.now().plusSeconds(3600))
                .maxUses(2)
                .usedCount(2)
                .build();

        HouseholdInvite acceptedInvite = HouseholdInvite.builder()
                .type(InviteType.DIRECT_USER)
                .status(InviteStatus.ACCEPTED)
                .expiresAt(java.time.Instant.now().plusSeconds(3600))
                .build();

        assertThat(validInvite.isValid()).isTrue();
        assertThat(expiredInvite.isValid()).isFalse();
        assertThat(maxedInvite.isValid()).isFalse();
        assertThat(acceptedInvite.isValid()).isFalse();
    }

    @Test
    @DisplayName("Should correctly increment usage and transition status when limit is reached")
    void invite_IncrementUsage() {
        HouseholdInvite linkInvite = HouseholdInvite.builder()
                .type(InviteType.LINK)
                .status(InviteStatus.PENDING)
                .maxUses(2)
                .usedCount(1)
                .build();

        linkInvite.incrementUsage();
        assertThat(linkInvite.getUsedCount()).isEqualTo(2);
        assertThat(linkInvite.getStatus()).isEqualTo(InviteStatus.EXPIRED);

        HouseholdInvite directInvite = HouseholdInvite.builder()
                .type(InviteType.DIRECT_USER)
                .status(InviteStatus.PENDING)
                .maxUses(1)
                .usedCount(0)
                .build();

        directInvite.incrementUsage();
        assertThat(directInvite.getUsedCount()).isEqualTo(1);
        assertThat(directInvite.getStatus()).isEqualTo(InviteStatus.ACCEPTED);
    }
}
