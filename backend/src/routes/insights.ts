import { Router } from 'express';
import { pool } from '../db';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

let client: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are a personal finance advisor analyzing a user's monthly spending dashboard.
You will receive structured spending data and must return a JSON object with exactly this shape:
{
  "summary": "2-3 sentence overall assessment of their financial health this month",
  "spendingInsights": ["insight 1", "insight 2", "insight 3"],
  "budgetRecommendations": [
    { "category": "Food", "currentBudget": 400, "recommendedBudget": 450, "reason": "short reason" }
  ],
  "aiTips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}
Keep each insight/tip to one concise sentence. Base recommendations on actual 3-month averages. No prose outside the JSON.`;

router.get('/', async (_req, res) => {
  try {
    // Month-over-month spending per category (last 3 months)
    const { rows: spendingRows } = await pool.query(`
      SELECT
        TO_CHAR(date, 'YYYY-MM') AS month,
        category,
        SUM(amount)::NUMERIC(10,2) AS total
      FROM transactions
      WHERE date >= DATE_TRUNC('month', NOW()) - INTERVAL '2 months'
      GROUP BY month, category
      ORDER BY month, category
    `);

    // Budget vs actual for current month
    const { rows: budgetRows } = await pool.query(`
      SELECT
        b.category,
        b.monthly_limit::NUMERIC(10,2) AS budget,
        COALESCE(SUM(t.amount), 0)::NUMERIC(10,2) AS actual
      FROM budgets b
      LEFT JOIN transactions t
        ON t.category = b.category
        AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', NOW())
      GROUP BY b.category, b.monthly_limit
      ORDER BY b.category
    `);

    // Build month-over-month deltas
    const byMonthCategory: Record<string, Record<string, number>> = {};
    for (const row of spendingRows) {
      if (!byMonthCategory[row.month]) byMonthCategory[row.month] = {};
      byMonthCategory[row.month][row.category] = parseFloat(row.total);
    }

    const months = Object.keys(byMonthCategory).sort();
    const currentMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];

    const spendingDeltas = Object.keys(byMonthCategory[currentMonth] ?? {}).map((cat) => {
      const current = byMonthCategory[currentMonth]?.[cat] ?? 0;
      const prev = byMonthCategory[prevMonth]?.[cat] ?? 0;
      const pctChange = prev > 0 ? ((current - prev) / prev) * 100 : 0;
      return { category: cat, current, prev, pctChange: Math.round(pctChange) };
    });

    // 3-month average per category for budget recommendations
    const avgByCategory: Record<string, number[]> = {};
    for (const row of spendingRows) {
      if (!avgByCategory[row.category]) avgByCategory[row.category] = [];
      avgByCategory[row.category].push(parseFloat(row.total));
    }
    const threeMonthAvg = Object.entries(avgByCategory).map(([category, totals]) => ({
      category,
      avg: Math.round(totals.reduce((a, b) => a + b, 0) / totals.length),
    }));

    const budgetStatus = budgetRows.map((r) => ({
      category: r.category,
      budget: parseFloat(r.budget),
      actual: parseFloat(r.actual),
      pct: parseFloat(r.budget) > 0 ? Math.round((parseFloat(r.actual) / parseFloat(r.budget)) * 100) : 0,
    }));

    // Compute local insights + recommendations as fallback / enrichment
    const localInsights = spendingDeltas
      .filter((d) => Math.abs(d.pctChange) >= 15)
      .sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange))
      .slice(0, 3)
      .map((d) =>
        d.pctChange > 0
          ? `${d.category} spending increased ${d.pctChange}% vs last month ($${d.prev.toFixed(2)} → $${d.current.toFixed(2)}).`
          : `${d.category} spending dropped ${Math.abs(d.pctChange)}% vs last month ($${d.prev.toFixed(2)} → $${d.current.toFixed(2)}).`
      );

    const localRecommendations = threeMonthAvg.map(({ category, avg }) => {
      const budgetRow = budgetStatus.find((b) => b.category === category);
      const currentBudget = budgetRow?.budget ?? avg;
      const recommendedBudget = Math.ceil(avg * 1.1 / 10) * 10;
      return {
        category,
        currentBudget,
        recommendedBudget,
        reason: `3-month average is $${avg}/mo; 10% buffer gives $${recommendedBudget}.`,
      };
    });

    const localTips = budgetStatus
      .filter((b) => b.pct > 80)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5)
      .map((b) =>
        b.pct > 100
          ? `Cut ${b.category} spending — you're ${b.pct - 100}% over budget this month.`
          : `Watch ${b.category} — you've used ${b.pct}% of your budget with the month ongoing.`
      );

    if (!client) {
      return res.json({
        summary: `This month you have ${budgetStatus.filter((b) => b.pct > 100).length} over-budget categories and ${budgetStatus.filter((b) => b.pct > 80 && b.pct <= 100).length} approaching their limit.`,
        spendingInsights: localInsights.length ? localInsights : ['Spending patterns are stable compared to last month.'],
        budgetRecommendations: localRecommendations,
        aiTips: localTips.length ? localTips : ['Keep tracking your spending — consistency is key to staying on budget.'],
        source: 'local',
      });
    }

    const prompt = `Here is this month's financial data:

BUDGET STATUS (current month):
${budgetStatus.map((b) => `- ${b.category}: $${b.actual.toFixed(2)} spent of $${b.budget.toFixed(2)} budget (${b.pct}%)`).join('\n')}

MONTH-OVER-MONTH CHANGES:
${spendingDeltas.map((d) => `- ${d.category}: $${d.current.toFixed(2)} this month vs $${d.prev.toFixed(2)} last month (${d.pctChange > 0 ? '+' : ''}${d.pctChange}%)`).join('\n')}

3-MONTH AVERAGES:
${threeMonthAvg.map((t) => `- ${t.category}: $${t.avg}/mo average`).join('\n')}

Provide your analysis as the JSON object described in the system prompt.`;

    const response = await (client as unknown as {
      messages: {
        create: (p: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }>;
      };
    }).messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    const parsed = JSON.parse(match[0]);

    return res.json({ ...parsed, source: 'claude' });
  } catch (err) {
    console.error('Insights error:', err);
    return res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
