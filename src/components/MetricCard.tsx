interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="metric-card">
      <h3 className="metric-title">{title}</h3>
      <p className="metric-value">{value}</p>
      {subtitle && <span className="metric-subtitle">{subtitle}</span>}
    </div>
  );
}
