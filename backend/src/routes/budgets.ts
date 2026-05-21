import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT category, monthly_limit FROM budgets ORDER BY category'
  );
  res.json(rows);
});

router.get('/history', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`
    SELECT id, category, old_limit, new_limit, changed_at
    FROM budget_history
    ORDER BY changed_at DESC
    LIMIT 50
  `);
  res.json(rows);
});

router.put('/:category', async (req: Request, res: Response) => {
  const { category } = req.params;
  const { monthly_limit } = req.body as { monthly_limit: number };

  if (monthly_limit == null || isNaN(monthly_limit) || monthly_limit < 0) {
    res.status(400).json({ error: 'monthly_limit must be a non-negative number' });
    return;
  }

  const existing = await pool.query(
    'SELECT monthly_limit FROM budgets WHERE category = $1',
    [category]
  );

  if (existing.rows.length === 0) {
    res.status(404).json({ error: 'Budget category not found' });
    return;
  }

  const oldLimit = parseFloat(existing.rows[0].monthly_limit);

  await pool.query(
    'INSERT INTO budget_history (category, old_limit, new_limit) VALUES ($1, $2, $3)',
    [category, oldLimit, monthly_limit]
  );

  const { rows } = await pool.query(
    'UPDATE budgets SET monthly_limit = $1 WHERE category = $2 RETURNING *',
    [monthly_limit, category]
  );

  res.json(rows[0]);
});

export default router;
