package com.apartment.survival.household.mapper;

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
import com.apartment.survival.household.model.Household;
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

    @Mapping(target = "householdId", source = "id")
    HouseholdResponse.Detail toDetail(Household household);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "joinedAt", source = "createdAt")
    HouseholdResponse.MemberSummary toMemberSummary(HouseholdMember member);

    // === Request DTO -> Entity ===

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "maxMembers", ignore = true)
    @Mapping(target = "archived", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Household toEntity(HouseholdRequest.Create request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "archived", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(HouseholdRequest.Update request, @MappingTarget Household household);
}
