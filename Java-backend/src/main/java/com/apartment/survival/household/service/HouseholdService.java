package com.apartment.survival.household.service;

import java.time.ZoneId;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

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
import com.apartment.survival.iam.model.User;
import com.apartment.survival.iam.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final UserRepository userRepository;
    private final HouseholdMapper householdMapper;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;

    // === 1. Create Household ===
    @Transactional
    public HouseholdResponse.Summary create(HouseholdRequest.Create request, UUID creatorUserId) {
        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + creatorUserId));

        Household household = householdMapper.toEntity(request);

        if (household.getCurrency() == null) {
            household.setCurrency(Currency.getInstance("MAD"));
        }
        if (household.getTimezone() == null) {
            household.setTimezone(ZoneId.of("Africa/Casablanca"));
        }

        HouseholdMember adminMember = HouseholdMember.builder()
                .user(creator)
                .role(HouseholdRole.ADMIN)
                .build();

        household.addMember(adminMember);

        // Cascades automatically persist both Household and HouseholdMember
        Household savedHousehold = householdRepository.save(household);

        return householdMapper.toSummary(savedHousehold);
    }

    // === 2. List User's Active Households ===
    @Transactional(readOnly = true)
    public List<HouseholdResponse.Summary> getUserHouseholds(UUID userId) {
        return householdRepository.findAllActiveByUser(userId).stream()
                .map(householdMapper::toSummary)
                .toList();
    }

    // === 3. Get Household Details with Roommates ===
    @Transactional(readOnly = true)
    public HouseholdResponse.Detail getHousehold(UUID householdId) {
        Household household = householdRepository.findActiveWithMembers(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        return householdMapper.toDetail(household);
    }

    // === 4. Update Household Settings ===
    @Transactional
    public HouseholdResponse.Summary update(UUID householdId, HouseholdRequest.Update request) {
        Household household = householdRepository.findActive(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        if (request.maxMembers() != null) {
            long currentMemberCount = memberRepository.countByHouseholdId(householdId);
            if (request.maxMembers() < currentMemberCount) {
                throw new BadRequestException("Max capacity (" + request.maxMembers() 
                        + ") cannot be lower than current member count (" + currentMemberCount + ")");
            }
        }

        householdMapper.updateEntity(request, household);
        return householdMapper.toSummary(household);
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
    public HouseholdResponse.MemberSummary updateMember(UUID householdId, UUID targetUserId, HouseholdRequest.UpdateMember request) {
        HouseholdMember member = memberRepository.findByActiveHouseholdIdAndUserId(householdId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Active membership not found for user: " + targetUserId));

        if (member.isAdmin() && request.role() != HouseholdRole.ADMIN) {
            long adminCount = memberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot demote the sole admin of the household. Promote another member to admin first.");
            }
        }

        member.setRole(request.role());
        member.setNickname(request.nickname() == null || request.nickname().isBlank() ? null : request.nickname().trim());

        return householdMapper.toMemberSummary(member);
    }

    // === 7. Remove Member or Self-Leave ===
    @Transactional
    public void removeMember(UUID householdId, UUID targetUserId) {
        HouseholdMember member = memberRepository.findByActiveHouseholdIdAndUserId(householdId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Active membership not found for user: " + targetUserId));

        if (member.isAdmin()) {
            long adminCount = memberRepository.countByHouseholdIdAndRole(householdId, HouseholdRole.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot leave or remove the sole admin of the household. Transfer admin ownership first.");
            }
        }

        Household household = member.getHousehold();
        household.removeMember(member);
        memberRepository.delete(member);
    }
}
