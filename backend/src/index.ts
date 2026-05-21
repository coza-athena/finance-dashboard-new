import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import transactionsRouter from './routes/transactions';
import spendingSummaryRouter from './routes/spendingSummary';
import budgetVsActualRouter from './routes/budgetVsActual';
import budgetsRouter from './routes/budgets';
import aiSuggestionsRouter from './routes/aiSuggestions';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/spending-summary', spendingSummaryRouter);
app.use('/api/budget-vs-actual', budgetVsActualRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/ai-suggestions', aiSuggestionsRouter);

initDb()
  .then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Backend running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
