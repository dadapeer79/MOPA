'use server';
/**
 * @fileOverview A flow for deleting a mock expense.
 *
 * - deleteExpense - A function that handles deleting an expense by its ID.
 */

import { ai } from '@/ai/genkit';
import { deleteMockExpense } from '@/services/expenses';
import { z } from 'zod';

const DeleteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});


export async function deleteExpense(
  expenseId: string
): Promise<z.infer<typeof DeleteOutputSchema>> {
  return deleteExpenseFlow(expenseId);
}

const deleteExpenseFlow = ai.defineFlow(
  {
    name: 'deleteExpenseFlow',
    inputSchema: z.string(),
    outputSchema: DeleteOutputSchema,
  },
  async (expenseId) => {
    return await deleteMockExpense(expenseId);
  }
);
