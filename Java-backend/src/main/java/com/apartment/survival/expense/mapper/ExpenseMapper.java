package com.apartment.survival.expense.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.apartment.survival.expense.dto.ExpenseRequest;
import com.apartment.survival.expense.dto.ExpenseResponse;
import com.apartment.survival.expense.model.Expense;
import com.apartment.survival.expense.model.ExpenseSplit;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    builder = @Builder(disableBuilder = true)
)
public interface ExpenseMapper {

    @Mapping(target = "expenseId", source = "expense.id")
    @Mapping(target = "paidByUserId", source = "expense.paidByUserId")
    @Mapping(target = "paidByUsername", source = "paidByUsername")
    @Mapping(target = "participantCount", source = "expense.participantCount")
    ExpenseResponse.Summary toSummary(Expense expense, String paidByUsername);

    @Mapping(target = "expenseId", source = "expense.id")
    @Mapping(target = "paidByUserId", source = "expense.paidByUserId")
    @Mapping(target = "paidByUsername", source = "paidByUsername")
    @Mapping(target = "splits", source = "splits")
    ExpenseResponse.Detail toDetail(Expense expense, String paidByUsername, List<ExpenseResponse.SplitDetail> splits);

    @Mapping(target = "splitId", source = "split.id")
    @Mapping(target = "userId", source = "split.userId")
    @Mapping(target = "username", source = "username")
    ExpenseResponse.SplitDetail toSplitDetail(ExpenseSplit split, String username);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "householdId", ignore = true)
    @Mapping(target = "paidByUserId", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "splits", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "expenseDate", defaultExpression = "java(java.time.Instant.now())")
    Expense toEntity(ExpenseRequest.Create request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "householdId", ignore = true)
    @Mapping(target = "paidByUserId", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "splitType", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "splits", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ExpenseRequest.Update request, @MappingTarget Expense expense);
}
