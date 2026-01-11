export interface WeeklyMetrics {
  week: string;
  openRate: number;
  clickRate: number;
  subscribers: number;
}

export interface SummaryStats {
  currentSubscribers: number;
  subscriberGrowth: number;
  subscriberGrowthPercent: number;
  avgOpenRate: number;
  avgClickRate: number;
  openRateTrend: number;
  clickRateTrend: number;
  totalWeeks: number;
  bestOpenRateWeek: string;
  bestClickRateWeek: string;
}

export function parseSheetData(rawData: string[][]): WeeklyMetrics[] {
  if (!rawData || rawData.length < 2) return [];

  const headers = rawData[0].map(h => h.toLowerCase().trim());
  const weekIdx = headers.findIndex(h => h.includes('week'));
  const openRateIdx = headers.findIndex(h => h.includes('open'));
  const clickRateIdx = headers.findIndex(h => h.includes('click'));
  const subscribersIdx = headers.findIndex(h =>
    h.includes('subscrib') || h.includes('subs') || h.includes('audience') || h.includes('list')
  );

  const data = rawData.slice(1).map(row => ({
    week: row[weekIdx] || '',
    openRate: parsePercent(row[openRateIdx]),
    clickRate: parsePercent(row[clickRateIdx]),
    subscribers: parseNumber(row[subscribersIdx]),
  })).filter(d => d.week);

  // Sort by date chronologically
  return data.sort((a, b) => {
    const dateA = parseWeekDate(a.week);
    const dateB = parseWeekDate(b.week);
    return dateA.getTime() - dateB.getTime();
  });
}

export function parseWeekDate(week: string): Date {
  // Handle various date formats: MM/DD, MM/DD/YY, MM/DD/YYYY
  const parts = week.split('/');
  if (parts.length >= 2) {
    const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[1], 10);
    let year = new Date().getFullYear();

    if (parts.length >= 3) {
      year = parseInt(parts[2], 10);
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
    } else {
      // If no year, infer from context (assume dates span at most ~1 year)
      // Use current year, but adjust if month suggests previous year
      const currentMonth = new Date().getMonth();
      if (month > currentMonth + 2) {
        year -= 1; // Date is likely from previous year
      }
    }

    return new Date(year, month, day);
  }

  // Fallback: try parsing as-is
  const parsed = new Date(week);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function parsePercent(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.toString().replace('%', '').trim();
  const num = parseFloat(cleaned);
  // If value was already a decimal (e.g., 0.45), convert to percentage
  if (num > 0 && num < 1) return num * 100;
  return isNaN(num) ? 0 : num;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.toString().replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function calculateSummaryStats(data: WeeklyMetrics[]): SummaryStats {
  if (data.length === 0) {
    return {
      currentSubscribers: 0,
      subscriberGrowth: 0,
      subscriberGrowthPercent: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      openRateTrend: 0,
      clickRateTrend: 0,
      totalWeeks: 0,
      bestOpenRateWeek: '-',
      bestClickRateWeek: '-',
    };
  }

  const currentSubscribers = data[data.length - 1].subscribers;
  // Compare to 4 weeks ago (or earliest available if less than 4 weeks)
  const fourWeeksAgoIdx = Math.max(0, data.length - 5);
  const fourWeeksAgoSubscribers = data[fourWeeksAgoIdx].subscribers;
  const subscriberGrowth = currentSubscribers - fourWeeksAgoSubscribers;
  const subscriberGrowthPercent = fourWeeksAgoSubscribers > 0
    ? ((subscriberGrowth / fourWeeksAgoSubscribers) * 100)
    : 0;

  const avgOpenRate = data.reduce((sum, d) => sum + d.openRate, 0) / data.length;
  const avgClickRate = data.reduce((sum, d) => sum + d.clickRate, 0) / data.length;

  // Calculate trends (last 4 weeks vs previous 4 weeks)
  const recentWeeks = data.slice(-4);
  const previousWeeks = data.slice(-8, -4);

  const recentOpenRate = recentWeeks.reduce((sum, d) => sum + d.openRate, 0) / recentWeeks.length;
  const previousOpenRate = previousWeeks.length > 0
    ? previousWeeks.reduce((sum, d) => sum + d.openRate, 0) / previousWeeks.length
    : recentOpenRate;
  const openRateTrend = recentOpenRate - previousOpenRate;

  const recentClickRate = recentWeeks.reduce((sum, d) => sum + d.clickRate, 0) / recentWeeks.length;
  const previousClickRate = previousWeeks.length > 0
    ? previousWeeks.reduce((sum, d) => sum + d.clickRate, 0) / previousWeeks.length
    : recentClickRate;
  const clickRateTrend = recentClickRate - previousClickRate;

  // Find best weeks
  const bestOpenRate = Math.max(...data.map(d => d.openRate));
  const bestClickRate = Math.max(...data.map(d => d.clickRate));
  const bestOpenRateWeek = data.find(d => d.openRate === bestOpenRate)?.week || '-';
  const bestClickRateWeek = data.find(d => d.clickRate === bestClickRate)?.week || '-';

  return {
    currentSubscribers,
    subscriberGrowth,
    subscriberGrowthPercent,
    avgOpenRate,
    avgClickRate,
    openRateTrend,
    clickRateTrend,
    totalWeeks: data.length,
    bestOpenRateWeek,
    bestClickRateWeek,
  };
}
