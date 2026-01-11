import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { WeeklyMetrics } from '../../utils/dataParser';

interface ClickRateChartProps {
  data: WeeklyMetrics[];
  avgClickRate: number;
}

export function ClickRateChart({ data, avgClickRate }: ClickRateChartProps) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Click Rate Trend</h3>
      <p className="chart-subtitle">Weekly email click-through rates</p>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="clickRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Click Rate']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <ReferenceLine
              y={avgClickRate}
              stroke="#94a3b8"
              strokeDasharray="5 5"
              label={{ value: 'Avg', position: 'right', fill: '#94a3b8', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="clickRate"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#clickRateGradient)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#059669' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
