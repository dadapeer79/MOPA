'use server';
/**
 * @fileOverview A flow for retrieving mock expense data.
 *
 * - getExpenses - A function that handles fetching expenses.
 * - Expense - The type for a single expense.
 */

import { ai } from '@/ai/genkit';
import { getMockExpenses } from '@/services/expenses';
import { z } from 'zod';

const ExpenseSchema = z.object({
  id: z.string().describe('The expense ID.'),
  description: z.string().describe('A description of the expense.'),
  amount: z.number().describe('The amount of the expense.'),
  category: z.string().describe('The category of the expense (e.g., utilities, rent).'),
  date: z.string().describe('The date the expense was recorded in ISO format.'),
});

export type Expense = z.infer<typeof ExpenseSchema>;

export async function getExpenses(): Promise<Expense[]> {
  return getExpensesFlow();
}

const getExpensesFlow = ai.defineFlow(
  {
    name: 'getExpensesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ExpenseSchema),
  },
  async () => {
    return await getMockExpenses();
  }
);
