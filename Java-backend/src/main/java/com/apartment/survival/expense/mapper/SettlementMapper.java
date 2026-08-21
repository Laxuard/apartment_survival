package com.apartment.survival.expense.mapper;

import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import com.apartment.survival.expense.dto.SettlementRequest;
import com.apartment.survival.expense.dto.SettlementResponse;
import com.apartment.survival.expense.model.Settlement;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    builder = @Builder(disableBuilder = true)
)
public interface SettlementMapper {

    @Mapping(target = "settlementId", source = "settlement.id")
    @Mapping(target = "payerUserId", source = "settlement.payerUserId")
    @Mapping(target = "payerUsername", source = "payerUsername")
    @Mapping(target = "recipientUserId", source = "settlement.recipientUserId")
    @Mapping(target = "recipientUsername", source = "recipientUsername")
    SettlementResponse.Detail toDetail(Settlement settlement, String payerUsername, String recipientUsername);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "householdId", ignore = true)
    @Mapping(target = "payerUserId", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "settledAt", defaultExpression = "java(java.time.Instant.now())")
    Settlement toEntity(SettlementRequest.Create request);
}
