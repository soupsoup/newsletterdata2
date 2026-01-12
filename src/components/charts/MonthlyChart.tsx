import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MonthlyMetrics } from '../../utils/dataParser';

interface MonthlyChartProps {
  data: MonthlyMetrics[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="chart-card chart-card-wide">
      <h3 className="chart-title">Monthly Performance</h3>
      <p className="chart-subtitle">Aggregated monthly metrics with subscriber growth</p>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'avgOpenRate') return [`${value.toFixed(1)}%`, 'Avg Open Rate'];
                if (name === 'avgClickRate') return [`${value.toFixed(1)}%`, 'Avg Click Rate'];
                if (name === 'subscriberGrowth') {
                  const prefix = value >= 0 ? '+' : '';
                  return [`${prefix}${value.toLocaleString()}`, 'Subscriber Growth'];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === 'avgOpenRate') return 'Avg Open Rate';
                if (value === 'avgClickRate') return 'Avg Click Rate';
                if (value === 'subscriberGrowth') return 'Subscriber Growth';
                return value;
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar yAxisId="right" dataKey="subscriberGrowth" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.subscriberGrowth >= 0 ? '#10b981' : '#ef4444'}
                  opacity={0.8}
                />
              ))}
            </Bar>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgOpenRate"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#2563eb' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgClickRate"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#d97706' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
