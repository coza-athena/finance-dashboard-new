import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SpendingSummary } from '../types';

// athenahealth-aligned palette: teal primary + complementary brand-safe hues
const CATEGORY_COLORS: Record<string, string> = {
  Food:          '#00857C',
  Transport:     '#2E4170',
  Housing:       '#00A99D',
  Entertainment: '#F4A01C',
  Utilities:     '#6B7E8F',
};

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];

interface Props {
  data: SpendingSummary[];
}

type ChartRow = { month: string } & Record<string, number>;

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
    <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ath-navy)' }}>Monthly Spending by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
          {CATEGORIES.map((cat) => (
            <Bar key={cat} dataKey={cat} fill={CATEGORY_COLORS[cat]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
