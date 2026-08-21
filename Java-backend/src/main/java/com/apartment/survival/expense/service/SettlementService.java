package com.apartment.survival.expense.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.expense.dto.SettlementRequest;
import com.apartment.survival.expense.dto.SettlementResponse;
import com.apartment.survival.expense.mapper.SettlementMapper;
import com.apartment.survival.expense.model.Settlement;
import com.apartment.survival.expense.repository.SettlementRepository;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final HouseholdPublicApi householdPublicApi;
    private final UserPublicApi userPublicApi;
    private final SettlementMapper settlementMapper;
    private final SettlementRepository settlementRepository;

    // === 1. Record a Settlement ===
    @Transactional
    public SettlementResponse.Detail create(UUID householdId, SettlementRequest.Create request, UUID payerUserId) {
        HouseholdPublicDto household = householdPublicApi.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));

        if (!householdPublicApi.isMember(householdId, payerUserId)) {
            throw new BadRequestException("Payer is not an active member of this household.");
        }
        if (!householdPublicApi.isMember(householdId, request.recipientUserId())) {
            throw new BadRequestException("Recipient is not an active member of this household.");
        }
        if (payerUserId.equals(request.recipientUserId())) {
            throw new BadRequestException("Cannot create a settlement with yourself.");
        }

        Settlement settlement = settlementMapper.toEntity(request);
        settlement.setHouseholdId(householdId);
        settlement.setPayerUserId(payerUserId);
        settlement.setCurrency(household.currency());

        Settlement saved = settlementRepository.save(settlement);

        Map<UUID, UserPublicDto> profiles = userPublicApi.findAllByIds(Set.of(payerUserId, request.recipientUserId()));
        String payerUsername = getUsernameOrDefault(profiles, payerUserId);
        String recipientUsername = getUsernameOrDefault(profiles, request.recipientUserId());

        return settlementMapper.toDetail(saved, payerUsername, recipientUsername);
    }

    // === 2. List Household Settlements ===
    @Transactional(readOnly = true)
    public List<SettlementResponse.Detail> getHouseholdSettlements(UUID householdId, Pageable pageable) {
        Page<Settlement> page = settlementRepository.findAllByHouseholdId(householdId, pageable);

        Set<UUID> userIds = new HashSet<>();
        for (Settlement s : page.getContent()) {
            userIds.add(s.getPayerUserId());
            userIds.add(s.getRecipientUserId());
        }

        Map<UUID, UserPublicDto> profiles = userPublicApi.findAllByIds(userIds);

        return page.getContent().stream()
                .map(s -> settlementMapper.toDetail(
                        s,
                        getUsernameOrDefault(profiles, s.getPayerUserId()),
                        getUsernameOrDefault(profiles, s.getRecipientUserId())
                ))
                .toList();
    }

    private String getUsernameOrDefault(Map<UUID, UserPublicDto> profiles, UUID userId) {
        UserPublicDto dto = profiles.get(userId);
        return dto != null ? dto.username() : "Unknown User";
    }
}
