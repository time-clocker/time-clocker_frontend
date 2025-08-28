type Hours = { diurnal?: number; nocturnal?: number; extra?: number; total?: number };
export type PdfProps = {
  employee: {
    full_name: string;
    email?: string;
    document_number?: string | null;
    hourly_rate?: number;
  };
  summary?: {
    hours?: Hours;
    pay_total?: number;
  };
  reportMeta?: {
    monthLabel?: string;
    generatedBy?: string;
    generatedAt?: string;
  };
};