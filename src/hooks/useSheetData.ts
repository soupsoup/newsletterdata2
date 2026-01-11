import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, SheetData } from '../types';

const API_URL = import.meta.env.DEV ? '/api/sheets' : '/api/sheets';

interface UseSheetDataResult {
  data: SheetData | null;
  sheets: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export function useSheetData(refreshInterval = 60000): UseSheetDataResult {
  const [data, setData] = useState<SheetData | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);
      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data);
      setSheets(result.sheets);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, sheets, loading, error, lastUpdated, refresh: fetchData };
}
