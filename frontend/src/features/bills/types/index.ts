export interface Bill {
  id: string;
  title: string;
  dueText: string;
  dueDays: number;
  amount: number;
  currency: string;
  autoSplit: boolean;
  perPersonText?: string;
  iconName: 'wifi' | 'home' | 'bolt' | 'water';
}
