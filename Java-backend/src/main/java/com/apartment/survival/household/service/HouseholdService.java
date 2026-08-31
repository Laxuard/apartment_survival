package com.apartment.survival.household.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final UserPublicApi userPublicApi; // DDD: Bounded context interaction via public API
    private final HouseholdMapper householdMapper;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;

    // === 1. Create Household ===
    @Transactional
    public HouseholdResponse.Summary create(HouseholdRequest.Create request, UUID creatorUserId) {
        if (!userPublicApi.existsById(creatorUserId)) {
            throw new ResourceNotFoundException("User not found: " + creatorUserId);
        }

        Household household = householdMapper.toEntity(request);

        HouseholdMember adminMember = HouseholdMember.builder()
                .userId(creatorUserId)
                .role(HouseholdRole.ADMIN)
                .build();

        household.addMember(adminMember);

        // Cascades automatically persist both Household and HouseholdMember
        Household savedHousehold = householdRepository.save(household);

        return householdMapper.toSummary(savedHousehold, HouseholdRole.ADMIN);
    }

    // === 2. List User's Active Households ===
    @Transactional(readOnly = true)
    public List<HouseholdResponse.Summary> getUserHouseholds(UUID userId) {
        return householdRepository.findAllActiveByUser(userId).stream()
                .map(household -> {
                    HouseholdRole userRole = household.getMembers().stream()
                            .filter(m -> m.getUserId().equals(userId))
                            .map(HouseholdMember::getRole)
                            .findFirst()
                            .orElse(HouseholdRole.MEMBER);
                    return householdMapper.toSummary(household, userRole);
                })
                .toList();
    }

    // === 3. Get Household Details with Roommates ===
    @Transactional(readOnly = true)

    public HouseholdResponse.Detail getHousehold(UUID householdId, UUID callerUserId) {
        Household household = householdRepository.findActiveWithMembers(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        Set<UUID> memberUserIds = household.getMembers().stream()
                .map(HouseholdMember::getUserId)
                .collect(Collectors.toSet());

        Map<UUID, UserPublicDto> userProfiles = userPublicApi.findAllByIds(memberUserIds);

        List<HouseholdResponse.MemberSummary> memberSummaries = household.getMembers().stream()
                .map(member -> {
                    UserPublicDto profile = userProfiles.get(member.getUserId());
                    String username = "Unknown User";
                    String email = "";
                    if (profile != null) {
                        username = profile.username();
                        email = profile.email();
                    }
                    return householdMapper.toMemberSummary(member, username, email);
                })
                .toList();

        HouseholdRole callerRole = callerUserId != null
                ? household.getMembers().stream()
                        .filter(m -> m.getUserId().equals(callerUserId))
                        .map(HouseholdMember::getRole)
                        .findFirst()
                        .orElse(null)
                : null;

        return householdMapper.toDetail(household, memberSummaries, callerRole);
    }

    // Overloaded convenience method
    @Transactional(readOnly = true)
    public HouseholdResponse.Detail getHousehold(UUID householdId) {
        return getHousehold(householdId, null);
    }

    // === 4. Update Household Settings ===
    @Transactional

    public HouseholdResponse.Summary update(UUID householdId, HouseholdRequest.Update request, UUID callerUserId) {
        Household household = householdRepository.findActiveWithMembers(householdId)
                .orElseGet(() -> householdRepository.findActive(householdId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Active household not found: " + householdId)));

        if (request.maxMembers() != null) {
            long currentMemberCount = memberRepository.countByHouseholdId(householdId);
            if (request.maxMembers() < currentMemberCount) {
                throw new BadRequestException("Max capacity (" + request.maxMembers()
                        + ") cannot be lower than current member count (" + currentMemberCount + ")");
            }
        }

        householdMapper.updateEntity(request, household);

        HouseholdRole callerRole = callerUserId != null && household.getMembers() != null
                ? household.getMembers().stream()
                        .filter(m -> m.getUserId().equals(callerUserId))
                        .map(HouseholdMember::getRole)
                        .findFirst()
                        .orElse(HouseholdRole.ADMIN)
                : HouseholdRole.ADMIN;

        return householdMapper.toSummary(household, callerRole);
    }

    // Overloaded convenience method
    @Transactional
    public HouseholdResponse.Summary update(UUID householdId, HouseholdRequest.Update request) {
        return update(householdId, request, null);
    }

    // === 5. Archive Household ===
    @Transactional
    public void archive(UUID householdId) {
        Household household = householdRepository.findActive(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        household.setArchived(true);
    }

    // === 6. Update Member Role or Nickname ===
    @Transactional
    public HouseholdResponse.MemberSummary updateMember(UUID householdId, UUID targetUserId,
            HouseholdRequest.UpdateMember request) {
        HouseholdMember member = memberRepository.findByActiveHouseholdIdAndUserId(householdId, targetUserId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Active membership not found for user: " + targetUserId));

        if (member.isAdmin() && request.role() != HouseholdRole.ADMIN) {
            long adminCount = memberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException(
                        "Cannot demote the sole admin of the household. Promote another member to admin first.");
            }
        }

        member.setRole(request.role());

        String nickname = null;
        if (request.nickname() != null && !request.nickname().isBlank()) {
            nickname = request.nickname().trim();
        }
        member.setNickname(nickname);

        UserPublicDto profile = userPublicApi.findById(targetUserId).orElse(null);
        String username = "Unknown User";
        String email = "";
        if (profile != null) {
            username = profile.username();
            email = profile.email();
        }

        return householdMapper.toMemberSummary(member, username, email);
    }

    // === 7. Remove Member or Self-Leave ===
    @Transactional
    public void removeMember(UUID householdId, UUID targetUserId) {
        HouseholdMember member = memberRepository.findByActiveHouseholdIdAndUserId(householdId, targetUserId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Active membership not found for user: " + targetUserId));

        if (member.isAdmin()) {
            long adminCount = memberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException(
                        "Cannot leave or remove the sole admin of the household. Transfer admin ownership first.");
            }
        }

        Household household = member.getHousehold();
        household.removeMember(member);
        memberRepository.delete(member);
    }
}
