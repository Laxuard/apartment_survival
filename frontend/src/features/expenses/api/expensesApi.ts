import { apiClient } from '@/lib/api-client';
import type {
  BackendExpenseSummary,
  BackendExpenseDetail,
  CreateExpenseBackendDto,
  HouseholdBalancesResponse,
  CreateSettlementDto,
  SettlementDetail,
} from '../types';

export const expensesApi = {
  getExpenses: async (householdId: string): Promise<BackendExpenseSummary[]> => {
    const { data } = await apiClient.get<BackendExpenseSummary[]>(
      `/households/${householdId}/expenses`
    );
    return data;
  },

  getExpenseDetail: async (
    householdId: string,
    expenseId: string
  ): Promise<BackendExpenseDetail> => {
    const { data } = await apiClient.get<BackendExpenseDetail>(
      `/households/${householdId}/expenses/${expenseId}`
    );
    return data;
  },

  createExpense: async (
    householdId: string,
    dto: CreateExpenseBackendDto
  ): Promise<BackendExpenseDetail> => {
    const { data } = await apiClient.post<BackendExpenseDetail>(
      `/households/${householdId}/expenses`,
      dto
    );
    return data;
  },

  getBalances: async (householdId: string): Promise<HouseholdBalancesResponse> => {
    const { data } = await apiClient.get<HouseholdBalancesResponse>(
      `/households/${householdId}/balances`
    );
    return data;
  },

  createSettlement: async (
    householdId: string,
    dto: CreateSettlementDto
  ): Promise<SettlementDetail> => {
    const { data } = await apiClient.post<SettlementDetail>(
      `/households/${householdId}/settlements`,
      dto
    );
    return data;
  },
};
