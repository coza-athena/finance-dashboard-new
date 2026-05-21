import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, limit } = req.query;
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (typeof category === 'string') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = typeof limit === 'string' ? `LIMIT ${parseInt(limit, 10)}` : '';

  const { rows } = await pool.query(
    `SELECT id, date, description, amount, category
     FROM transactions
     ${where}
     ORDER BY date DESC
     ${limitClause}`,
    params
  );

  res.json(rows);
});

export default router;
