export interface SelectOption {
  value: string | number;
  description: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  icon?: string;
  options?: SelectOption[];
  isEndOfDay?: boolean;
}

export type ModelValue = Record<string, string | number | boolean | SelectOption | null | undefined>;

export interface SelectOption {
  value: string | number;
  description: string;
}
export interface BaseFilters {
  fullName?: string;
  phoneNumber?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  creditType?: SelectOption | null;
}
