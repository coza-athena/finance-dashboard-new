import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import transactionsRouter from './routes/transactions';
import spendingSummaryRouter from './routes/spendingSummary';
import budgetVsActualRouter from './routes/budgetVsActual';
import budgetsRouter from './routes/budgets';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/spending-summary', spendingSummaryRouter);
app.use('/api/budget-vs-actual', budgetVsActualRouter);
app.use('/api/budgets', budgetsRouter);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
