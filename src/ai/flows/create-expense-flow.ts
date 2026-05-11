'use server';
/**
 * @fileOverview A flow for creating a new mock expense.
 *
 * - createExpense - A function that handles creating and saving a new expense.
 */

import { ai } from '@/ai/genkit';
import { addMockExpense } from '@/services/expenses';
import { z } from 'zod';

const CreateExpenseInputSchema = z.object({
  description: z.string().describe('A description of the expense.'),
  amount: z.number().describe('The amount of the expense.'),
  category: z.string().describe('The category of the expense.'),
});

const ExpenseSchema = CreateExpenseInputSchema.extend({
    id: z.string().describe('The expense ID.'),
    date: z.string().describe('The date of the expense in ISO format.'),
});

export async function createExpense(
  input: z.infer<typeof CreateExpenseInputSchema>
): Promise<z.infer<typeof ExpenseSchema>> {
  return createExpenseFlow(input);
}

const createExpenseFlow = ai.defineFlow(
  {
    name: 'createExpenseFlow',
    inputSchema: CreateExpenseInputSchema,
    outputSchema: ExpenseSchema,
  },
  async (expenseData) => {
    const newExpense = await addMockExpense(expenseData);
    return newExpense;
  }
);
