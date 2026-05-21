import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query(`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      category,
      SUM(amount)::NUMERIC(10,2) AS total
    FROM transactions
    WHERE date >= DATE_TRUNC('month', NOW()) - INTERVAL '2 months'
    GROUP BY month, category
    ORDER BY month, category
  `);

  res.json(rows);
});

export default router;
