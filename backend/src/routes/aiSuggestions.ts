import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const MOCK_TIPS: Record<string, string[]> = {
  Food: [
    'Plan meals weekly and batch-cook to reduce impulse takeout orders.',
    'Use a grocery list app to avoid duplicate purchases and reduce waste.',
    'Try store-brand alternatives — they\'re often 20-30% cheaper with similar quality.',
  ],
  Transport: [
    'Combine errands into single trips to cut fuel or transit costs.',
    'Look into monthly transit passes — often cheaper than per-ride fares.',
    'Carpool with colleagues or neighbors for recurring commutes.',
  ],
  Housing: [
    'Review recurring subscriptions (streaming, gym) and cancel unused ones.',
    'Negotiate utility rates or switch to a lower-cost provider.',
    'Use energy-efficient settings on appliances to lower utility bills.',
  ],
  Entertainment: [
    'Look for free local events, parks, and community activities.',
    'Share streaming service plans with family or friends.',
    'Set a monthly entertainment budget and track it weekly.',
  ],
  Utilities: [
    'Unplug devices when not in use to reduce phantom energy draw.',
    'Adjust thermostat schedules — small changes add up over a month.',
    'Check for utility rebate programs for energy-efficient upgrades.',
  ],
};

function mockTips(category: string): string[] {
  return MOCK_TIPS[category] ?? [
    'Review this category\'s spending and identify the top 2-3 recurring expenses.',
    'Set a weekly sub-limit to spread spending more evenly across the month.',
    'Look for one-time alternatives or cheaper substitutes for regular purchases.',
  ];
}

let client: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

router.post('/', async (req, res) => {
  const { category, actual, budget } = req.body as {
    category: string;
    actual: number;
    budget: number;
  };

  if (!category || actual == null || budget == null) {
    return res.status(400).json({ error: 'category, actual, and budget are required' });
  }

  if (!client) {
    return res.json({ tips: mockTips(category), source: 'mock' });
  }

  try {
    const overage = (actual - budget).toFixed(2);
    const pct = ((actual / budget) * 100).toFixed(0);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: {
        type: 'text',
        text: 'You are a personal finance advisor. When given a budget overage, respond with exactly 3 concise, actionable saving tips as a JSON array of strings. No prose outside the JSON. Example: ["Tip one.", "Tip two.", "Tip three."]',
        // @ts-ignore — cache_control is a beta field
        cache_control: { type: 'ephemeral' },
      } as Parameters<typeof client.messages.create>[0]['system'],
      messages: [
        {
          role: 'user',
          content: `Category: ${category}. Budget: $${budget.toFixed(2)}. Actual: $${actual.toFixed(2)}. Over budget by $${overage} (${pct}%). Give 3 tips to reduce spending in this category next month.`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '[]';
    const match = text.match(/\[[\s\S]*\]/);
    const tips: string[] = match ? JSON.parse(match[0]) : mockTips(category);
    return res.json({ tips, source: 'claude' });
  } catch {
    return res.json({ tips: mockTips(category), source: 'mock' });
  }
});

export default router;
