package com.apartment.survival.household.mapper;

import java.util.List;

import org.mapstruct.*;

import com.apartment.survival.household.dto.HouseholdRequest;
import com.apartment.survival.household.dto.HouseholdResponse;
import com.apartment.survival.household.dto.InviteResponse;
import com.apartment.survival.household.model.Household;
import com.apartment.survival.household.model.HouseholdInvite;
import com.apartment.survival.household.model.HouseholdMember;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface HouseholdMapper {

    // === Entity -> Response DTOs ===

    @Mapping(target = "householdId", source = "id")
    @Mapping(target = "memberCount", expression = "java(household.getMembers() != null ? household.getMembers().size() : 0)")
    @Mapping(target = "role", ignore = true)
    HouseholdResponse.Summary toSummary(Household household);

    @Mapping(target = "householdId", source = "household.id")
    @Mapping(target = "name", source = "household.name")
    @Mapping(target = "description", source = "household.description")
    @Mapping(target = "avatarUrl", source = "household.avatarUrl")
    @Mapping(target = "currency", source = "household.currency")
    @Mapping(target = "timezone", source = "household.timezone")
    @Mapping(target = "maxMembers", source = "household.maxMembers")
    @Mapping(target = "monthlyBudget", source = "household.monthlyBudget")
    @Mapping(target = "wifiSsid", source = "household.wifiSsid")
    @Mapping(target = "wifiPassword", source = "household.wifiPassword")
    @Mapping(target = "splitAlgorithm", source = "household.splitAlgorithm")
    @Mapping(target = "autoRestockFromExpenses", source = "household.autoRestockFromExpenses")
    @Mapping(target = "archived", source = "household.archived")
    @Mapping(target = "createdAt", source = "household.createdAt")
    @Mapping(target = "memberCount", expression = "java(household.getMembers() != null ? household.getMembers().size() : 0)")
    @Mapping(target = "role", source = "role")
    HouseholdResponse.Summary toSummary(Household household, com.apartment.survival.household.model.HouseholdRole role);

    @Mapping(target = "householdId", source = "household.id")
    @Mapping(target = "name", source = "household.name")
    @Mapping(target = "description", source = "household.description")
    @Mapping(target = "avatarUrl", source = "household.avatarUrl")
    @Mapping(target = "currency", source = "household.currency")
    @Mapping(target = "timezone", source = "household.timezone")
    @Mapping(target = "maxMembers", source = "household.maxMembers")
    @Mapping(target = "monthlyBudget", source = "household.monthlyBudget")
    @Mapping(target = "wifiSsid", source = "household.wifiSsid")
    @Mapping(target = "wifiPassword", source = "household.wifiPassword")
    @Mapping(target = "splitAlgorithm", source = "household.splitAlgorithm")
    @Mapping(target = "autoRestockFromExpenses", source = "household.autoRestockFromExpenses")
    @Mapping(target = "archived", source = "household.archived")
    @Mapping(target = "createdAt", source = "household.createdAt")
    @Mapping(target = "memberCount", expression = "java(household.getMembers() != null ? household.getMembers().size() : 0)")
    @Mapping(target = "members", source = "members")
    @Mapping(target = "role", ignore = true)
    HouseholdResponse.Detail toDetail(Household household, List<HouseholdResponse.MemberSummary> members);

    @Mapping(target = "householdId", source = "household.id")
    @Mapping(target = "name", source = "household.name")
    @Mapping(target = "description", source = "household.description")
    @Mapping(target = "avatarUrl", source = "household.avatarUrl")
    @Mapping(target = "currency", source = "household.currency")
    @Mapping(target = "timezone", source = "household.timezone")
    @Mapping(target = "maxMembers", source = "household.maxMembers")
    @Mapping(target = "monthlyBudget", source = "household.monthlyBudget")
    @Mapping(target = "wifiSsid", source = "household.wifiSsid")
    @Mapping(target = "wifiPassword", source = "household.wifiPassword")
    @Mapping(target = "splitAlgorithm", source = "household.splitAlgorithm")
    @Mapping(target = "autoRestockFromExpenses", source = "household.autoRestockFromExpenses")
    @Mapping(target = "archived", source = "household.archived")
    @Mapping(target = "createdAt", source = "household.createdAt")
    @Mapping(target = "memberCount", expression = "java(household.getMembers() != null ? household.getMembers().size() : 0)")
    @Mapping(target = "members", source = "members")
    @Mapping(target = "role", source = "role")
    HouseholdResponse.Detail toDetail(Household household, List<HouseholdResponse.MemberSummary> members,
            com.apartment.survival.household.model.HouseholdRole role);

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
    @Mapping(target = "archived", constant = "false")
    @Mapping(target = "currency", defaultExpression = "java(java.util.Currency.getInstance(\"MAD\"))")
    @Mapping(target = "timezone", defaultExpression = "java(java.time.ZoneId.of(\"Africa/Casablanca\"))")
    @Mapping(target = "maxMembers", defaultExpression = "java(request.maxMembers() != null ? request.maxMembers() : 10)")
    @Mapping(target = "monthlyBudget", defaultExpression = "java(request.monthlyBudget() != null ? request.monthlyBudget() : java.math.BigDecimal.ZERO)")
    @Mapping(target = "splitAlgorithm", defaultExpression = "java(request.splitAlgorithm() != null ? request.splitAlgorithm() : \"DEBT_SIMPLIFIED\")")
    @Mapping(target = "autoRestockFromExpenses", defaultExpression = "java(request.autoRestockFromExpenses() != null ? request.autoRestockFromExpenses() : true)")
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
