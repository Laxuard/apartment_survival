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
}
