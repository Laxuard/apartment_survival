package com.apartment.survival.household.service;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HouseholdPublicApiImpl implements HouseholdPublicApi {

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean isMember(UUID householdId, UUID userId) {
        if (householdId == null || userId == null) {
            return false;
        }
        return memberRepository.isMember(householdId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsActive(UUID householdId) {
        if (householdId == null) {
            return false;
        }
        return householdRepository.findActive(householdId).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HouseholdPublicDto> findById(UUID householdId) {
        if (householdId == null) {
            return Optional.empty();
        }
        return householdRepository.findActive(householdId)
                .map(h -> new HouseholdPublicDto(
                        h.getId(),
                        h.getName(),
                        h.getCurrency(),
                        h.getTimezone(),
                        h.isArchived(),
                        h.getMaxMembers()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> getActiveMemberUserIds(UUID householdId) {
        if (householdId == null) {
            return Set.of();
        }
        return householdRepository.findActiveWithMembers(householdId)
                .map(h -> h.getMembers().stream()
                        .map(HouseholdMember::getUserId)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());
    }
}
