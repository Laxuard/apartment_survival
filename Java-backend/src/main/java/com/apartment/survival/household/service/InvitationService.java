package com.apartment.survival.household.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteRequest;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.event.HouseholdInviteAcceptedEvent;
import com.apartment.survival.household.event.HouseholdInviteCreatedEvent;
import com.apartment.survival.household.mapper.HouseholdMapper;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdInvite;
import com.apartment.survival.household.model.HouseholdMember;
import com.apartment.survival.household.model.HouseholdRole;
import com.apartment.survival.household.model.InviteStatus;
import com.apartment.survival.household.model.InviteType;
import com.apartment.survival.household.repository.HouseholdInviteRepository;
import com.apartment.survival.household.repository.HouseholdMemberRepository;
import com.apartment.survival.household.repository.HouseholdRepository;
import com.apartment.survival.iam.api.UserPublicApi;
import com.apartment.survival.iam.api.UserPublicDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private static final String CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base-32 excluding lookalikes (0/O, 1/I)
    private static final SecureRandom RANDOM = new SecureRandom();

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInviteRepository inviteRepository;
    private final UserPublicApi userPublicApi;
    private final HouseholdMapper householdMapper;
    private final ApplicationEventPublisher eventPublisher;

    // === 1. Create Shareable Link/Code Invite (Admins only) ===
    @Transactional
    public InviteResponse.HouseholdInviteSummary createLinkInvite(UUID householdId, InviteRequest.CreateLink request, UUID creatorUserId) {
        Household household = getActiveHouseholdOrThrow(householdId);
        validateHouseholdCapacity(household);

        int validDays = 7;
        Integer maxUses = null;
        if (request != null) {
            validDays = request.validDays();
            maxUses = request.maxUses();
        }

        String uniqueCode = generateUniqueCode();

        HouseholdInvite invite = HouseholdInvite.builder()
                .household(household)
                .createdByUserId(creatorUserId)
                .type(InviteType.LINK)
                .code(uniqueCode)
                .maxUses(maxUses)
                .expiresAt(Instant.now().plus(Duration.ofDays(validDays)))
                .build();

        HouseholdInvite saved = inviteRepository.save(invite);
        publishInviteCreated(saved, null);

        return householdMapper.toInviteSummary(saved, null);
    }

    // === 2. Create Direct Username Invite (Admins only) ===
    @Transactional
    public InviteResponse.HouseholdInviteSummary createDirectInvite(UUID householdId, InviteRequest.CreateDirect request, UUID creatorUserId) {
        Household household = getActiveHouseholdOrThrow(householdId);
        validateHouseholdCapacity(household);

        // Resolve target user from IAM module public contract
        UserPublicDto targetUser = userPublicApi.findByUsername(request.username().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.username()));

        if (memberRepository.isMember(householdId, targetUser.userId())) {
            throw new BadRequestException("User is already a member of this household.");
        }

        if (inviteRepository.hasActiveInvite(householdId, targetUser.userId(), Instant.now())) {
            throw new BadRequestException("A pending invite already exists for this user.");
        }

        int validDays = request.validDays();

        HouseholdInvite invite = HouseholdInvite.builder()
                .household(household)
                .createdByUserId(creatorUserId)
                .type(InviteType.DIRECT_USER)
                .targetUserId(targetUser.userId())
                .maxUses(1)
                .expiresAt(Instant.now().plus(Duration.ofDays(validDays)))
                .build();

        HouseholdInvite saved = inviteRepository.save(invite);
        publishInviteCreated(saved, null);

        return householdMapper.toInviteSummary(saved, targetUser.username());
    }

    // === 3. Join Via Shareable Code ===
    @Transactional
    public HouseholdResponse.Summary joinViaCode(InviteRequest.JoinWithCode request, UUID userId) {
        if (!userPublicApi.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        String normalizedCode = request.code().trim().toUpperCase();
        HouseholdInvite invite = inviteRepository.findActiveByCode(normalizedCode)
                .orElseThrow(() -> new BadRequestException("Invalid or expired invite code."));

        if (!invite.isValid()) {
            invite.setStatus(InviteStatus.EXPIRED);
            throw new BadRequestException("This invite link has expired or reached its maximum uses.");
        }

        return processUserJoining(invite.getHousehold(), invite, userId);
    }

    // === 4. Accept Direct Invite from Inbox ===
    @Transactional
    public HouseholdResponse.Summary acceptDirectInvite(UUID inviteId, UUID userId) {
        if (!userPublicApi.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        HouseholdInvite invite = inviteRepository.findActiveById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Active invite not found: " + inviteId));

        if (invite.getType() != InviteType.DIRECT_USER || !userId.equals(invite.getTargetUserId())) {
            throw new BadRequestException("You are not authorized to accept this invite.");
        }

        if (!invite.isValid()) {
            throw new BadRequestException("This invite is no longer valid.");
        }

        return processUserJoining(invite.getHousehold(), invite, userId);
    }

    // === 5. Decline Direct Invite ===
    @Transactional
    public void declineDirectInvite(UUID inviteId, UUID userId) {
        HouseholdInvite invite = inviteRepository.findActiveById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Active invite not found: " + inviteId));

        if (invite.getType() != InviteType.DIRECT_USER || !userId.equals(invite.getTargetUserId())) {
            throw new BadRequestException("You are not authorized to decline this invite.");
        }

        invite.setStatus(InviteStatus.DECLINED);
    }

    // === 6. Revoke Invite (Admins only) ===
    @Transactional
    public void revokeInvite(UUID householdId, UUID inviteId) {
        HouseholdInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found: " + inviteId));

        if (!invite.getHousehold().getId().equals(householdId)) {
            throw new BadRequestException("Invite does not belong to this household.");
        }

        invite.setStatus(InviteStatus.REVOKED);
    }

    // === 7. Get User Pending Inbox Invites (/api/me/invites) ===
    @Transactional(readOnly = true)
    public List<InviteResponse.UserInboxInvite> getUserPendingInvites(UUID userId) {
        List<HouseholdInvite> invites = inviteRepository.findUserInbox(userId, Instant.now());
        if (invites.isEmpty()) {
            return List.of();
        }

        // Batch lookup of inviters' usernames to eliminate N+1 queries
        Set<UUID> creatorIds = invites.stream()
                .map(HouseholdInvite::getCreatedByUserId)
                .collect(Collectors.toSet());
        Map<UUID, UserPublicDto> creatorProfiles = userPublicApi.findAllByIds(creatorIds);

        return invites.stream().map(invite -> {
            UserPublicDto inviter = creatorProfiles.get(invite.getCreatedByUserId());
            String inviterName = "A roommate";
            if (inviter != null) {
                inviterName = inviter.username();
            }
            return householdMapper.toInboxInvite(invite, inviterName);
        }).toList();
    }

    // === 8. Get All Household Invites (Admins audit) ===
    @Transactional(readOnly = true)
    public List<InviteResponse.HouseholdInviteSummary> getHouseholdInvites(UUID householdId) {
        List<HouseholdInvite> invites = inviteRepository.findAllByHousehold(householdId);
        if (invites.isEmpty()) {
            return List.of();
        }

        // Batch resolve target usernames for DIRECT_USER invites
        Set<UUID> targetUserIds = invites.stream()
                .map(HouseholdInvite::getTargetUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, UserPublicDto> targetProfiles = userPublicApi.findAllByIds(targetUserIds);

        return invites.stream().map(invite -> {
            String targetUsername = null;
            if (invite.getTargetUserId() != null) {
                UserPublicDto profile = targetProfiles.get(invite.getTargetUserId());
                if (profile != null) {
                    targetUsername = profile.username();
                } else {
                    targetUsername = "Unknown User";
                }
            }
            return householdMapper.toInviteSummary(invite, targetUsername);
        }).toList();
    }

    // === Internal Helper Logic ===

    private HouseholdResponse.Summary processUserJoining(Household household, HouseholdInvite invite, UUID userId) {
        if (household.isArchived()) {
            throw new BadRequestException("Cannot join an archived household.");
        }

        if (memberRepository.isMember(household.getId(), userId)) {
            throw new BadRequestException("You are already a member of this household.");
        }

        validateHouseholdCapacity(household);

        HouseholdMember newMember = HouseholdMember.builder()
                .userId(userId)
                .role(HouseholdRole.MEMBER)
                .build();
        household.addMember(newMember);

        // Update invite lifecycle state
        invite.incrementUsage();
        if (invite.getType() == InviteType.DIRECT_USER) {
            invite.setStatus(InviteStatus.ACCEPTED);
        }

        // Publish decoupled domain event
        eventPublisher.publishEvent(new HouseholdInviteAcceptedEvent(invite.getId(), household.getId(), userId));

        return householdMapper.toSummary(household);
    }

    private void validateHouseholdCapacity(Household household) {
        long currentMembers = memberRepository.countByHouseholdId(household.getId());
        if (currentMembers >= household.getMaxMembers()) {
            throw new BadRequestException("Household has reached its maximum member capacity (" + household.getMaxMembers() + ").");
        }
    }

    private Household getActiveHouseholdOrThrow(UUID householdId) {
        return householdRepository.findActive(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Active household not found: " + householdId));
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder(9);
            for (int i = 0; i < 8; i++) {
                if (i == 4) {
                    sb.append('-');
                }
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (inviteRepository.findActiveByCode(code).isEmpty()) {
                return code;
            }
        }
        throw new IllegalStateException("Failed to generate unique invite code. Please retry.");
    }

    private void publishInviteCreated(HouseholdInvite invite, String targetEmail) {
        eventPublisher.publishEvent(new HouseholdInviteCreatedEvent(
                invite.getId(),
                invite.getHousehold().getId(),
                invite.getHousehold().getName(),
                invite.getCreatedByUserId(),
                invite.getType(),
                invite.getTargetUserId(),
                targetEmail,
                invite.getCode(),
                invite.getExpiresAt()
        ));
    }
}
