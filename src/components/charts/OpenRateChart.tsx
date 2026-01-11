import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { WeeklyMetrics } from '../../utils/dataParser';

interface OpenRateChartProps {
  data: WeeklyMetrics[];
  avgOpenRate: number;
}

export function OpenRateChart({ data, avgOpenRate }: OpenRateChartProps) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Open Rate Trend</h3>
      <p className="chart-subtitle">Weekly email open rates</p>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Open Rate']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <ReferenceLine
              y={avgOpenRate}
              stroke="#94a3b8"
              strokeDasharray="5 5"
              label={{ value: 'Avg', position: 'right', fill: '#94a3b8', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="openRate"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
