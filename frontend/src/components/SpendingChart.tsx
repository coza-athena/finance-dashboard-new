import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SpendingSummary } from '../types';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];

// Neon-teal futuristic palette
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  Food:          ['#00FFD1', '#00857C'],
  Transport:     ['#7B9FFF', '#2E4170'],
  Housing:       ['#00E5FF', '#007A99'],
  Entertainment: ['#FFD166', '#F4A01C'],
  Utilities:     ['#B0BEC5', '#546E7A'],
};

const GLOW_COLORS: Record<string, string> = {
  Food:          '#00FFD1',
  Transport:     '#7B9FFF',
  Housing:       '#00E5FF',
  Entertainment: '#FFD166',
  Utilities:     '#B0BEC5',
};

interface Props {
  data: SpendingSummary[];
}

type ChartRow = { month: string } & { [key: string]: string | number };

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: 'rgba(10, 20, 40, 0.92)',
      border: '1px solid rgba(0,255,209,0.3)',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 0 20px rgba(0,255,209,0.15)',
    }}>
      <p style={{ color: '#00FFD1', fontWeight: 700, fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>
        {label}
      </p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color, fontSize: 12, margin: '2px 0' }}>
          <span style={{ opacity: 0.7 }}>{item.name}: </span>
          <span style={{ fontWeight: 700 }}>${item.value.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
}

export default function SpendingChart({ data }: Props) {
  const chartData = data.reduce<ChartRow[]>((acc, row) => {
    let entry = acc.find((e) => e.month === row.month);
    if (!entry) {
      entry = { month: row.month };
      acc.push(entry);
    }
    entry[row.category] = parseFloat(row.total);
    return acc;
  }, []);

  return (
    <div className="rounded-xl shadow-lg p-6" style={{
      background: 'linear-gradient(145deg, #0A1628 0%, #0D2137 60%, #0A1E30 100%)',
      border: '1px solid rgba(0,255,209,0.2)',
      boxShadow: '0 0 30px rgba(0,133,124,0.15), inset 0 0 60px rgba(0,0,0,0.3)',
    }}>
      {/* SVG gradient defs */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          {CATEGORIES.map((cat) => {
            const [top, bottom] = CATEGORY_GRADIENTS[cat];
            return (
              <linearGradient key={cat} id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={top} stopOpacity={0.95} />
                <stop offset="100%" stopColor={bottom} stopOpacity={0.7} />
              </linearGradient>
            );
          })}
        </defs>
      </svg>

      <div className="flex items-center gap-2 mb-5">
        <div style={{
          width: 3, height: 20, borderRadius: 2,
          background: 'linear-gradient(to bottom, #00FFD1, #00857C)',
          boxShadow: '0 0 8px #00FFD1',
        }} />
        <h2 className="text-base font-bold tracking-widest uppercase" style={{ color: '#00FFD1', letterSpacing: '0.12em' }}>
          Monthly Spending
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(180,210,230,0.7)', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(0,255,209,0.2)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fill: 'rgba(180,210,230,0.5)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,255,209,0.04)' }} />
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value) => (
              <span style={{ color: GLOW_COLORS[value] ?? '#aaa', fontSize: 11, fontWeight: 500 }}>
                {value}
              </span>
            )}
          />
          {CATEGORIES.map((cat) => (
            <Bar key={cat} dataKey={cat} fill={`url(#grad-${cat})`} radius={[4, 4, 0, 0]}
              style={{ filter: `drop-shadow(0 0 4px ${GLOW_COLORS[cat]}88)` }}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={`url(#grad-${cat})`} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
