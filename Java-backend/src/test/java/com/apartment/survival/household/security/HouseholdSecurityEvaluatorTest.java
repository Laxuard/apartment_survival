package com.apartment.survival.household.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.iam.security.UserDetailsImpl;

@ExtendWith(MockitoExtension.class)
@DisplayName("HouseholdSecurityEvaluator Unit Tests")
class HouseholdSecurityEvaluatorTest {

    @Mock
    private HouseholdMemberRepository memberRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private HouseholdSecurityEvaluator securityEvaluator;

    private static final UUID CURRENT_USER_ID = UUID.randomUUID();
    private static final UUID OTHER_USER_ID = UUID.randomUUID();
    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateUser(UUID userId) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId, "user@test.com", "TestUser", "hashed_pwd", true, true, List.of()
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        when(authentication.getPrincipal()).thenReturn(userDetails);
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
    }

    // ==========================================
    // 1. IS HOUSEHOLD MEMBER
    // ==========================================
    @Nested
    @DisplayName("isHouseholdMember()")
    class IsHouseholdMemberTests {

        @Test
        @DisplayName("Should return true when user is logged in and is a member of the household")
        void isHouseholdMember_Member_ReturnsTrue() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.isMember(HOUSEHOLD_ID, CURRENT_USER_ID)).thenReturn(true);

            boolean allowed = securityEvaluator.isHouseholdMember(HOUSEHOLD_ID);

            assertThat(allowed).isTrue();
            verify(memberRepository).isMember(HOUSEHOLD_ID, CURRENT_USER_ID);
        }

        @Test
        @DisplayName("Should return false when user is logged in but not a member")
        void isHouseholdMember_NotMember_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.isMember(HOUSEHOLD_ID, CURRENT_USER_ID)).thenReturn(false);

            boolean allowed = securityEvaluator.isHouseholdMember(HOUSEHOLD_ID);

            assertThat(allowed).isFalse();
        }

        @Test
        @DisplayName("Should return false when unauthenticated (anonymous session)")
        void isHouseholdMember_Unauthenticated_ReturnsFalse() {
            SecurityContextHolder.clearContext();

            boolean allowed = securityEvaluator.isHouseholdMember(HOUSEHOLD_ID);

            assertThat(allowed).isFalse();
            verifyNoInteractions(memberRepository);
        }

        @Test
        @DisplayName("Should return false when householdId is null")
        void isHouseholdMember_NullHouseholdId_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);

            boolean allowed = securityEvaluator.isHouseholdMember(null);

            assertThat(allowed).isFalse();
            verifyNoInteractions(memberRepository);
        }
    }

    // ==========================================
    // 2. IS HOUSEHOLD ADMIN
    // ==========================================
    @Nested
    @DisplayName("isHouseholdAdmin()")
    class IsHouseholdAdminTests {

        @Test
        @DisplayName("Should return true when user has ADMIN role in the household")
        void isHouseholdAdmin_Admin_ReturnsTrue() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.hasRole(HOUSEHOLD_ID, CURRENT_USER_ID, HouseholdRole.ADMIN)).thenReturn(true);

            boolean allowed = securityEvaluator.isHouseholdAdmin(HOUSEHOLD_ID);

            assertThat(allowed).isTrue();
        }

        @Test
        @DisplayName("Should return false when user is a regular MEMBER (not admin)")
        void isHouseholdAdmin_RegularMember_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.hasRole(HOUSEHOLD_ID, CURRENT_USER_ID, HouseholdRole.ADMIN)).thenReturn(false);

            boolean allowed = securityEvaluator.isHouseholdAdmin(HOUSEHOLD_ID);

            assertThat(allowed).isFalse();
        }

        @Test
        @DisplayName("Should return false when unauthenticated")
        void isHouseholdAdmin_Unauthenticated_ReturnsFalse() {
            SecurityContextHolder.clearContext();

            boolean allowed = securityEvaluator.isHouseholdAdmin(HOUSEHOLD_ID);

            assertThat(allowed).isFalse();
            verifyNoInteractions(memberRepository);
        }
    }

    // ==========================================
    // 3. IS SELF OR ADMIN
    // ==========================================
    @Nested
    @DisplayName("isSelfOrAdmin()")
    class IsSelfOrAdminTests {

        @Test
        @DisplayName("Should return true when user is modifying themselves and belongs to household")
        void isSelfOrAdmin_SelfAndMember_ReturnsTrue() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.isMember(HOUSEHOLD_ID, CURRENT_USER_ID)).thenReturn(true);

            boolean allowed = securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, CURRENT_USER_ID);

            assertThat(allowed).isTrue();
            verify(memberRepository).isMember(HOUSEHOLD_ID, CURRENT_USER_ID);
            verify(memberRepository, never()).hasRole(any(), any(), any());
        }

        @Test
        @DisplayName("Should return false when modifying themselves but is not in household")
        void isSelfOrAdmin_SelfAndNotMember_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.isMember(HOUSEHOLD_ID, CURRENT_USER_ID)).thenReturn(false);

            boolean allowed = securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, CURRENT_USER_ID);

            assertThat(allowed).isFalse();
        }

        @Test
        @DisplayName("Should return true when user is NOT self, but is an ADMIN of the household")
        void isSelfOrAdmin_NotSelf_Admin_ReturnsTrue() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.hasRole(HOUSEHOLD_ID, CURRENT_USER_ID, HouseholdRole.ADMIN)).thenReturn(true);

            boolean allowed = securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, OTHER_USER_ID);

            assertThat(allowed).isTrue();
        }

        @Test
        @DisplayName("Should return false when user is NOT self and is NOT an admin (Forbidden kick/update)")
        void isSelfOrAdmin_NotSelf_NotAdmin_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);
            when(memberRepository.hasRole(HOUSEHOLD_ID, CURRENT_USER_ID, HouseholdRole.ADMIN)).thenReturn(false);

            boolean allowed = securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, OTHER_USER_ID);

            assertThat(allowed).isFalse();
        }

        @Test
        @DisplayName("Should return false when unauthenticated or any argument is null")
        void isSelfOrAdmin_NullArguments_ReturnsFalse() {
            authenticateUser(CURRENT_USER_ID);

            assertThat(securityEvaluator.isSelfOrAdmin(null, CURRENT_USER_ID)).isFalse();
            assertThat(securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, null)).isFalse();

            SecurityContextHolder.clearContext();
            assertThat(securityEvaluator.isSelfOrAdmin(HOUSEHOLD_ID, CURRENT_USER_ID)).isFalse();
        }
    }
}
