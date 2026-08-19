package com.apartment.survival.household.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdInvite;
import com.apartment.survival.household.model.HouseholdMember;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    builder = @Builder(disableBuilder = true)
)
public interface HouseholdMapper {

    // === Entity -> Response DTOs ===

    @Mapping(target = "householdId", source = "id")
    @Mapping(target = "memberCount", expression = "java(household.getMembers() != null ? household.getMembers().size() : 0)")
    HouseholdResponse.Summary toSummary(Household household);

    @Mapping(target = "householdId", source = "household.id")
    @Mapping(target = "members", source = "members")
    HouseholdResponse.Detail toDetail(Household household, List<HouseholdResponse.MemberSummary> members);

    @Mapping(target = "userId", source = "member.userId")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "role", source = "member.role")
    @Mapping(target = "nickname", source = "member.nickname")
    @Mapping(target = "joinedAt", source = "member.createdAt")
    HouseholdResponse.MemberSummary toMemberSummary(HouseholdMember member, String username, String email);

    // === Request DTO -> Entity ===

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "maxMembers", ignore = true)
    @Mapping(target = "archived", constant = "false")
    @Mapping(target = "currency", defaultExpression = "java(java.util.Currency.getInstance(\"MAD\"))")
    @Mapping(target = "timezone", defaultExpression = "java(java.time.ZoneId.of(\"Africa/Casablanca\"))")
    Household toEntity(HouseholdRequest.Create request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "archived", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(HouseholdRequest.Update request, @MappingTarget Household household);

    // === Invite Response Mappings ===

    @Mapping(target = "inviteId", source = "invite.id")
    @Mapping(target = "type", source = "invite.type")
    @Mapping(target = "status", source = "invite.status")
    @Mapping(target = "code", source = "invite.code")
    @Mapping(target = "targetUsername", source = "targetUsername")
    @Mapping(target = "maxUses", source = "invite.maxUses")
    @Mapping(target = "usedCount", source = "invite.usedCount")
    @Mapping(target = "expiresAt", source = "invite.expiresAt")
    @Mapping(target = "createdAt", source = "invite.createdAt")
    InviteResponse.HouseholdInviteSummary toInviteSummary(HouseholdInvite invite, String targetUsername);

    @Mapping(target = "inviteId", source = "invite.id")
    @Mapping(target = "householdId", source = "invite.household.id")
    @Mapping(target = "householdName", source = "invite.household.name")
    @Mapping(target = "householdDescription", source = "invite.household.description")
    @Mapping(target = "invitedByUsername", source = "invitedByUsername")
    @Mapping(target = "expiresAt", source = "invite.expiresAt")
    @Mapping(target = "createdAt", source = "invite.createdAt")
    InviteResponse.UserInboxInvite toInboxInvite(HouseholdInvite invite, String invitedByUsername);
}
