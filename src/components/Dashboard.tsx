import { useState, useMemo } from 'react';
import { useSheetData } from '../hooks/useSheetData';
import { DataTable } from './DataTable';
import { StatCard } from './StatCard';
import {
  OpenRateChart,
  ClickRateChart,
  SubscriberChart,
  EngagementChart,
  WeeklyGrowthChart,
} from './charts';
import { parseSheetData, calculateSummaryStats, parseWeekDate, type WeeklyMetrics } from '../utils/dataParser';

type ViewMode = 'charts' | 'table';

const NEWSLETTERS = ['Scale', 'Exploit', 'Prompt'] as const;
type Newsletter = typeof NEWSLETTERS[number];
type TabOption = 'Overall' | Newsletter;

export function Dashboard() {
  const { data, sheets, loading, error, lastUpdated, refresh } = useSheetData(60000);
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [activeTab, setActiveTab] = useState<TabOption>('Overall');

  // Check which newsletters have data
  const availableNewsletters = useMemo(() => {
    if (!data || sheets.length === 0) return [];
    return NEWSLETTERS.filter((nl) =>
      sheets.some((s) => s.toLowerCase() === nl.toLowerCase())
    );
  }, [data, sheets]);

  // Parse data for each newsletter
  const newsletterData = useMemo(() => {
    if (!data || sheets.length === 0) return {};

    const result: Record<string, { parsed: WeeklyMetrics[]; raw: string[][] }> = {};

    for (const newsletter of NEWSLETTERS) {
      const sheetName = sheets.find(
        (s) => s.toLowerCase() === newsletter.toLowerCase()
      );

      if (sheetName && data[sheetName] && data[sheetName].length >= 2) {
        result[newsletter] = {
          parsed: parseSheetData(data[sheetName]),
          raw: data[sheetName],
        };
      }
    }

    return result;
  }, [data, sheets]);

  // Calculate combined data for Overall view
  const overallData = useMemo(() => {
    const allParsed = Object.values(newsletterData).map((d) => d.parsed);
    if (allParsed.length === 0) return { parsed: [], combined: [] };

    // Get all unique weeks across all newsletters, sorted chronologically
    const weekSet = new Set<string>();
    allParsed.forEach((data) => data.forEach((d) => weekSet.add(d.week)));
    const weeks = Array.from(weekSet).sort((a, b) => {
      return parseWeekDate(a).getTime() - parseWeekDate(b).getTime();
    });

    // Combine data by week - sum subscribers, average rates
    const combined: WeeklyMetrics[] = weeks.map((week) => {
      const weekData = allParsed
        .map((data) => data.find((d) => d.week === week))
        .filter(Boolean) as WeeklyMetrics[];

      if (weekData.length === 0) {
        return { week, openRate: 0, clickRate: 0, subscribers: 0 };
      }

      return {
        week,
        openRate: weekData.reduce((sum, d) => sum + d.openRate, 0) / weekData.length,
        clickRate: weekData.reduce((sum, d) => sum + d.clickRate, 0) / weekData.length,
        subscribers: weekData.reduce((sum, d) => sum + d.subscribers, 0),
      };
    });

    return { parsed: combined, combined };
  }, [newsletterData]);

  // Get current view data based on active tab
  const { parsedData, stats, rawData } = useMemo(() => {
    if (activeTab === 'Overall') {
      if (overallData.parsed.length === 0) {
        return { parsedData: [], stats: null, rawData: null };
      }
      const summary = calculateSummaryStats(overallData.parsed);

      // Create combined raw data for table view
      const headers = ['Week', 'Avg Open Rate', 'Avg Click Rate', 'Total Subscribers'];
      const rows = overallData.parsed.map((d) => [
        d.week,
        `${d.openRate.toFixed(1)}%`,
        `${d.clickRate.toFixed(1)}%`,
        d.subscribers.toLocaleString(),
      ]);

      return {
        parsedData: overallData.parsed,
        stats: summary,
        rawData: [headers, ...rows],
      };
    }

    const nlData = newsletterData[activeTab];
    if (!nlData) {
      return { parsedData: [], stats: null, rawData: null };
    }

    return {
      parsedData: nlData.parsed,
      stats: calculateSummaryStats(nlData.parsed),
      rawData: nlData.raw,
    };
  }, [activeTab, newsletterData, overallData]);

  // Calculate per-newsletter stats for Overall view cards
  const newsletterStats = useMemo(() => {
    return NEWSLETTERS.map((nl) => {
      const nlData = newsletterData[nl];
      if (!nlData || nlData.parsed.length === 0) return null;
      const stats = calculateSummaryStats(nlData.parsed);
      return { name: nl, stats };
    }).filter(Boolean) as { name: Newsletter; stats: ReturnType<typeof calculateSummaryStats> }[];
  }, [newsletterData]);

  if (loading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading newsletter data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={refresh} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const isOverallAvailable = availableNewsletters.length > 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Newsletter Analytics</h1>
            <p className="header-subtitle">Track your newsletter performance</p>
          </div>
          <div className="header-actions">
            {lastUpdated && (
              <span className="last-updated">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button onClick={refresh} className="refresh-button" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Newsletter Tabs */}
      <div className="newsletter-tabs-container">
        <nav className="newsletter-tabs">
          {/* Overall Tab */}
          <button
            className={`newsletter-tab overall-tab ${activeTab === 'Overall' ? 'active' : ''} ${!isOverallAvailable ? 'disabled' : ''}`}
            onClick={() => isOverallAvailable && setActiveTab('Overall')}
            disabled={!isOverallAvailable}
          >
            <span className="newsletter-tab-name">Overall</span>
            {isOverallAvailable && (
              <span className="newsletter-tab-badge">{availableNewsletters.length} newsletters</span>
            )}
          </button>

          {/* Individual Newsletter Tabs */}
          {NEWSLETTERS.map((newsletter) => {
            const isAvailable = availableNewsletters.includes(newsletter);
            return (
              <button
                key={newsletter}
                className={`newsletter-tab ${activeTab === newsletter ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => isAvailable && setActiveTab(newsletter)}
                disabled={!isAvailable}
              >
                <span className="newsletter-tab-name">{newsletter}</span>
                {!isAvailable && <span className="newsletter-tab-badge">No Data</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="dashboard-main">
        {/* Overall View - Newsletter Comparison Cards */}
        {activeTab === 'Overall' && newsletterStats.length > 0 && (
          <section className="newsletter-comparison">
            <h2 className="section-title">Newsletter Comparison</h2>
            <div className="comparison-grid">
              {newsletterStats.map(({ name, stats }) => (
                <div key={name} className="comparison-card">
                  <h3 className="comparison-card-title">{name}</h3>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="comparison-stat-value">
                        {stats.currentSubscribers.toLocaleString()}
                      </span>
                      <span className="comparison-stat-label">Subscribers</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="comparison-stat-value">
                        {stats.avgOpenRate.toFixed(1)}%
                      </span>
                      <span className="comparison-stat-label">Avg Open</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="comparison-stat-value">
                        {stats.avgClickRate.toFixed(1)}%
                      </span>
                      <span className="comparison-stat-label">Avg Click</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats Overview */}
        {stats && (
          <section className="stats-section">
            <StatCard
              title={activeTab === 'Overall' ? 'Total Subscribers (All)' : 'Total Subscribers'}
              value={stats.currentSubscribers.toLocaleString()}
              trend={stats.subscriberGrowthPercent}
              trendLabel="vs 4 wks ago"
              color="purple"
            />
            <StatCard
              title={activeTab === 'Overall' ? 'Avg Open Rate (Combined)' : 'Avg Open Rate'}
              value={`${stats.avgOpenRate.toFixed(1)}%`}
              trend={stats.openRateTrend}
              trendLabel="vs prev 4 wks"
              color="blue"
            />
            <StatCard
              title={activeTab === 'Overall' ? 'Avg Click Rate (Combined)' : 'Avg Click Rate'}
              value={`${stats.avgClickRate.toFixed(1)}%`}
              trend={stats.clickRateTrend}
              trendLabel="vs prev 4 wks"
              color="green"
            />
            <StatCard
              title="Weeks Tracked"
              value={stats.totalWeeks}
              subtitle={`Best open: ${stats.bestOpenRateWeek}`}
              color="orange"
            />
          </section>
        )}

        {/* View Toggle */}
        <div className="view-toggle-container">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'charts' ? 'active' : ''}`}
              onClick={() => setViewMode('charts')}
            >
              Charts
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>

        {/* Charts View */}
        {viewMode === 'charts' && parsedData.length > 0 && stats && (
          <section className="charts-section">
            <EngagementChart data={parsedData} />

            <div className="charts-grid">
              <OpenRateChart data={parsedData} avgOpenRate={stats.avgOpenRate} />
              <ClickRateChart data={parsedData} avgClickRate={stats.avgClickRate} />
            </div>

            <div className="charts-grid">
              <SubscriberChart data={parsedData} />
              <WeeklyGrowthChart data={parsedData} />
            </div>
          </section>
        )}

        {/* Table View */}
        {viewMode === 'table' && rawData && (
          <section className="data-section">
            <DataTable
              data={rawData}
              title={activeTab === 'Overall' ? 'Combined Data' : activeTab}
            />
          </section>
        )}

        {/* No Data State */}
        {parsedData.length === 0 && !loading && (
          <div className="no-data-container">
            <h3>No Data {activeTab !== 'Overall' ? `for ${activeTab}` : 'Available'}</h3>
            <p>
              {activeTab === 'Overall'
                ? 'Make sure your spreadsheet has sheets named Scale, Exploit, or Prompt with the required columns.'
                : `Make sure your spreadsheet has a sheet named "${activeTab}" with columns for Week, Open Rate, Click Rate, and Subscribers.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
