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
import { parseSheetData, calculateSummaryStats } from '../utils/dataParser';

type ViewMode = 'charts' | 'table';

const NEWSLETTERS = ['Scale', 'Exploit', 'Prompt'] as const;
type Newsletter = typeof NEWSLETTERS[number];

export function Dashboard() {
  const { data, sheets, loading, error, lastUpdated, refresh } = useSheetData(60000);
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [activeNewsletter, setActiveNewsletter] = useState<Newsletter>('Scale');

  // Parse data and calculate stats for active newsletter
  const { parsedData, stats, rawData } = useMemo(() => {
    if (!data || sheets.length === 0) {
      return { parsedData: [], stats: null, rawData: null };
    }

    // Find the sheet that matches the active newsletter (case-insensitive)
    const sheetName = sheets.find(
      (s) => s.toLowerCase() === activeNewsletter.toLowerCase()
    );

    if (!sheetName || !data[sheetName] || data[sheetName].length < 2) {
      return { parsedData: [], stats: null, rawData: null };
    }

    const sheetData = data[sheetName];
    const parsed = parseSheetData(sheetData);
    const summary = calculateSummaryStats(parsed);

    return { parsedData: parsed, stats: summary, rawData: sheetData };
  }, [data, sheets, activeNewsletter]);

  // Check which newsletters have data
  const availableNewsletters = useMemo(() => {
    if (!data || sheets.length === 0) return [];
    return NEWSLETTERS.filter((nl) =>
      sheets.some((s) => s.toLowerCase() === nl.toLowerCase())
    );
  }, [data, sheets]);

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
          {NEWSLETTERS.map((newsletter) => {
            const isAvailable = availableNewsletters.includes(newsletter);
            return (
              <button
                key={newsletter}
                className={`newsletter-tab ${activeNewsletter === newsletter ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => isAvailable && setActiveNewsletter(newsletter)}
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
        {/* Stats Overview */}
        {stats && (
          <section className="stats-section">
            <StatCard
              title="Total Subscribers"
              value={stats.currentSubscribers.toLocaleString()}
              trend={stats.subscriberGrowthPercent}
              trendLabel="total growth"
              color="purple"
            />
            <StatCard
              title="Avg Open Rate"
              value={`${stats.avgOpenRate.toFixed(1)}%`}
              trend={stats.openRateTrend}
              trendLabel="vs prev 4 wks"
              color="blue"
            />
            <StatCard
              title="Avg Click Rate"
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
            <DataTable data={rawData} title={activeNewsletter} />
          </section>
        )}

        {/* No Data State */}
        {parsedData.length === 0 && !loading && (
          <div className="no-data-container">
            <h3>No Data for {activeNewsletter}</h3>
            <p>
              Make sure your spreadsheet has a sheet named "{activeNewsletter}" with columns for
              Week, Open Rate, Click Rate, and Subscribers.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
