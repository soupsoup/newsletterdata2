import { useState } from 'react';
import { useSheetData } from '../hooks/useSheetData';
import { DataTable } from './DataTable';
import { MetricCard } from './MetricCard';

export function Dashboard() {
  const { data, sheets, loading, error, lastUpdated, refresh } = useSheetData(60000);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Calculate some basic metrics from the first sheet
  const calculateMetrics = () => {
    if (!data || sheets.length === 0) return [];

    const firstSheet = data[sheets[0]];
    if (!firstSheet || firstSheet.length < 2) return [];

    const rowCount = firstSheet.length - 1; // Exclude header
    const colCount = firstSheet[0]?.length || 0;

    return [
      { title: 'Total Rows', value: rowCount },
      { title: 'Columns', value: colCount },
      { title: 'Sheets', value: sheets.length },
    ];
  };

  const metrics = calculateMetrics();
  const currentSheet = activeSheet || sheets[0];

  if (loading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading spreadsheet data...</p>
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
          <h1>Newsletter Dashboard</h1>
          <div className="header-actions">
            {lastUpdated && (
              <span className="last-updated">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button onClick={refresh} className="refresh-button" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {metrics.length > 0 && (
          <section className="metrics-section">
            {metrics.map((metric, index) => (
              <MetricCard key={index} title={metric.title} value={metric.value} />
            ))}
          </section>
        )}

        {sheets.length > 1 && (
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

        {data && currentSheet && data[currentSheet] && (
          <section className="data-section">
            <DataTable data={data[currentSheet]} title={currentSheet} />
          </section>
        )}
      </main>
    </div>
  );
}
