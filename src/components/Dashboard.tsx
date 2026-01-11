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

export function Dashboard() {
  const { data, sheets, loading, error, lastUpdated, refresh } = useSheetData(60000);
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Parse data and calculate stats
  const { parsedData, stats } = useMemo(() => {
    if (!data || sheets.length === 0) {
      return { parsedData: [], stats: null };
    }

    const firstSheet = data[sheets[0]];
    if (!firstSheet || firstSheet.length < 2) {
      return { parsedData: [], stats: null };
    }

    const parsed = parseSheetData(firstSheet);
    const summary = calculateSummaryStats(parsed);

    return { parsedData: parsed, stats: summary };
  }, [data, sheets]);

  const currentSheet = activeSheet || sheets[0];

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

          {sheets.length > 1 && viewMode === 'table' && (
            <nav className="sheet-tabs">
              {sheets.map((sheet) => (
                <button
                  key={sheet}
                  className={`sheet-tab ${currentSheet === sheet ? 'active' : ''}`}
                  onClick={() => setActiveSheet(sheet)}
                >
                  {sheet}
                </button>
              ))}
            </nav>
          )}
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
        {viewMode === 'table' && data && currentSheet && data[currentSheet] && (
          <section className="data-section">
            <DataTable data={data[currentSheet]} title={currentSheet} />
          </section>
        )}

        {/* No Data State */}
        {parsedData.length === 0 && !loading && (
          <div className="no-data-container">
            <h3>No Data Available</h3>
            <p>Make sure your spreadsheet has data with columns for Week, Open Rate, Click Rate, and Subscribers.</p>
          </div>
        )}
      </main>
    </div>
  );
}
