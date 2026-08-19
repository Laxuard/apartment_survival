package com.apartment.survival.household.security;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.iam.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Component("householdSecurity")
@RequiredArgsConstructor
public class HouseholdSecurityEvaluator {

    private final HouseholdMemberRepository memberRepository;

    /**
     * Verifies that the authenticated user is an active member of the specified household.
     */
    public boolean isHouseholdMember(UUID householdId) {
        UUID currentUserId = getCurrentUserId();
        if (currentUserId == null || householdId == null) {
            return false;
        }
        return memberRepository.isMember(householdId, currentUserId);
    }

    /**
     * Verifies that the authenticated user is an ADMIN of the specified household.
     */
    public boolean isHouseholdAdmin(UUID householdId) {
        UUID currentUserId = getCurrentUserId();
        if (currentUserId == null || householdId == null) {
            return false;
        }
        return memberRepository.hasRole(householdId, currentUserId, HouseholdRole.ADMIN);
    }

    /**
     * Verifies that the user is modifying their own membership OR is an ADMIN of the household.
     */
    public boolean isSelfOrAdmin(UUID householdId, UUID targetUserId) {
        UUID currentUserId = getCurrentUserId();
        if (currentUserId == null || householdId == null || targetUserId == null) {
            return false;
        }
        if (currentUserId.equals(targetUserId)) {
            return memberRepository.isMember(householdId, currentUserId);
        }
        return isHouseholdAdmin(householdId);
    }

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getUserId();
        }
        return null;
    }
}
