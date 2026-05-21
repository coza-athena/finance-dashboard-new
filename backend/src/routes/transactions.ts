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

router.post('/', async (req: Request, res: Response) => {
  const { date, description, amount, category } = req.body as {
    date: string; description: string; amount: number; category: string;
  };

  if (!date || !description || amount == null || !category) {
    res.status(400).json({ error: 'date, description, amount, and category are required' });
    return;
  }

  const { rows } = await pool.query(
    `INSERT INTO transactions (date, description, amount, category)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [date, description, amount, category]
  );

  res.status(201).json(rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { date, description, amount, category } = req.body as {
    date: string; description: string; amount: number; category: string;
  };

  if (!date || !description || amount == null || !category) {
    res.status(400).json({ error: 'date, description, amount, and category are required' });
    return;
  }

  const { rows } = await pool.query(
    `UPDATE transactions
     SET date = $1, description = $2, amount = $3, category = $4
     WHERE id = $5
     RETURNING *`,
    [date, description, amount, category, id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  res.json(rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { rowCount } = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

  if (rowCount === 0) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  res.status(204).send();
});

export default router;
