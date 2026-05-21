import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`
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

  res.json(rows);
});

export default router;
