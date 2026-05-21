import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT category, monthly_limit FROM budgets ORDER BY category'
  );
  res.json(rows);
});

router.put('/:category', async (req: Request, res: Response) => {
  const { category } = req.params;
  const { monthly_limit } = req.body as { monthly_limit: number };

  if (monthly_limit == null || isNaN(monthly_limit) || monthly_limit < 0) {
    res.status(400).json({ error: 'monthly_limit must be a non-negative number' });
    return;
  }

  const { rows } = await pool.query(
    `UPDATE budgets SET monthly_limit = $1 WHERE category = $2 RETURNING *`,
    [monthly_limit, category]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Budget category not found' });
    return;
  }

  res.json(rows[0]);
});

export default router;
