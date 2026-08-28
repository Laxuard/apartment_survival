import { apiClient } from '@/lib/api-client';
import type { Bill, CreateBillDto } from '../types';

export const billsApi = {
  getBills: async (householdId: string): Promise<Bill[]> => {
    const { data } = await apiClient.get<Bill[]>(`/households/${householdId}/bills`);
    return data;
  },

  createBill: async (householdId: string, dto: CreateBillDto): Promise<Bill> => {
    const { data } = await apiClient.post<Bill>(`/households/${householdId}/bills`, dto);
    return data;
  },

  payBill: async (householdId: string, billId: string): Promise<{ success: boolean; billId: string }> => {
    const { data } = await apiClient.post<{ success: boolean; billId: string }>(
      `/households/${householdId}/bills/${billId}/pay`
    );
    return data;
  },
};

