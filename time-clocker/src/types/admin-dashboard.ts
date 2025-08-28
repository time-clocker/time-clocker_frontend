export type GlobalMonthlyRow = {
  employee_id: string;
  full_name: string;
  hours: { diurnal: number; nocturnal: number; extra: number; total: number };
  pay_total: number;
};

export type GlobalMonthlyResponse = {
  range?: { from?: string; to?: string; timezone?: string };
  rows: GlobalMonthlyRow[];
  totals?: { hours_total?: number; pay_total?: number };
};