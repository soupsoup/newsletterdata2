interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ title, value, subtitle, trend, trendLabel, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    purple: 'stat-card-purple',
    orange: 'stat-card-orange',
  };

  return (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {trend !== undefined && (
          <span className={`stat-card-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            {trendLabel && <span className="trend-label"> {trendLabel}</span>}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
}
