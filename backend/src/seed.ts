import { pool, initDb } from './db';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'] as const;

const DESCRIPTIONS: Record<string, string[]> = {
  Food: ['Grocery Run', 'Coffee Shop', 'Food Delivery', 'Restaurant Lunch', 'Bakery Stop'],
  Transport: ['Bus Pass', 'Fuel Fill-up', 'Parking Fee', 'Ride Share', 'Train Ticket'],
  Housing: ['Monthly Rent', 'Home Supplies', 'Cleaning Service', 'Hardware Store'],
  Entertainment: ['Streaming Service', 'Movie Tickets', 'Concert Ticket', 'Book Purchase', 'Game Download'],
  Utilities: ['Electric Bill', 'Water Bill', 'Internet Service', 'Phone Plan'],
};

const AMOUNT_RANGES: Record<string, [number, number]> = {
  Food: [8, 85],
  Transport: [5, 60],
  Housing: [200, 900],
  Entertainment: [10, 50],
  Utilities: [30, 80],
};

const BUDGETS: Record<string, number> = {
  Food: 400,
  Transport: 150,
  Housing: 1300,
  Entertainment: 200,
  Utilities: 180,
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDay(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = randomInt(1, daysInMonth);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function seed(): Promise<void> {
  await initDb();

  await pool.query('TRUNCATE transactions, budgets RESTART IDENTITY CASCADE');

  // Insert budgets
  for (const [category, limit] of Object.entries(BUDGETS)) {
    await pool.query(
      'INSERT INTO budgets (category, monthly_limit) VALUES ($1, $2)',
      [category, limit]
    );
  }

  // Generate 3 months of transactions
  const now = new Date();
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    for (const category of CATEGORIES) {
      const count = randomInt(4, 8);
      const descs = DESCRIPTIONS[category];
      const [min, max] = AMOUNT_RANGES[category];

      for (let i = 0; i < count; i++) {
        const date = randomDay(year, month);
        const description = descs[randomInt(0, descs.length - 1)];
        const amount = randomBetween(min, max);

        await pool.query(
          'INSERT INTO transactions (date, description, amount, category) VALUES ($1, $2, $3, $4)',
          [date, description, amount, category]
        );
      }
    }
  }

  console.log('Database seeded successfully.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
