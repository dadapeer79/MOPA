'use server';
/**
 * @fileOverview A flow for retrieving recent UPI transactions.
 *
 * - getRecentTransactions - A function that handles fetching recent transactions.
 * - RecentTransaction - The type for a single recent transaction.
 */

import { ai } from '@/ai/genkit';
import { getRecentUpiTransactions } from '@/ai/tools/upi-tools';
import { z } from 'zod';

const RecentTransactionSchema = z.object({
  id: z.string().describe('The transaction ID.'),
  amount: z.number().describe('The transaction amount.'),
  sender: z.string().describe('The name of the sender.'),
  timestamp: z.string().describe('The timestamp of the transaction.'),
});

export type RecentTransaction = z.infer<typeof RecentTransactionSchema>;

export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  return getRecentTransactionsFlow();
}

const getRecentTransactionsFlow = ai.defineFlow(
  {
    name: 'getRecentTransactionsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(RecentTransactionSchema),
  },
  async () => {
    return await getRecentUpiTransactions();
  }
);
