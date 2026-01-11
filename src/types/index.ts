export interface SheetData {
  [sheetName: string]: string[][];
}

export interface ApiResponse {
  success: boolean;
  data: SheetData;
  sheets: string[];
  lastUpdated: string;
  error?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}
