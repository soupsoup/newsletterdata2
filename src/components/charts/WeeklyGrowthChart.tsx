import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { WeeklyMetrics } from '../../utils/dataParser';

interface WeeklyGrowthChartProps {
  data: WeeklyMetrics[];
}

export function WeeklyGrowthChart({ data }: WeeklyGrowthChartProps) {
  // Calculate week-over-week growth
  const growthData = data.slice(1).map((item, index) => {
    const previousSubscribers = data[index].subscribers;
    const growth = item.subscribers - previousSubscribers;
    return {
      week: item.week,
      growth,
      isPositive: growth >= 0,
    };
  });

  return (
    <div className="chart-card">
      <h3 className="chart-title">Weekly Subscriber Growth</h3>
      <p className="chart-subtitle">New subscribers added each week</p>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value >= 0 ? '+' : ''}${value.toLocaleString()}`,
                'Growth',
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
              {growthData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPositive ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
