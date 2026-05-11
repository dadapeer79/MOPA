'use server';
/**
 * @fileOverview Tools for interacting with a mock UPI service.
 *
 * - getRecentUpiTransactions - A tool to fetch recent UPI transactions.
 */

import { ai } from '@/ai/genkit';
import { getRecentTransactions as getMockUpiTransactions } from '@/services/upi';
import { z } from 'zod';

export const getRecentUpiTransactions = ai.defineTool(
  {
    name: 'getRecentUpiTransactions',
    description: 'Returns the most recent UPI transactions.',
    outputSchema: z.array(
      z.object({
        id: z.string(),
        amount: z.number(),
        sender: z.string(),
        timestamp: z.string(),
      })
    ),
  },
  async () => {
    return await getMockUpiTransactions();
  }
);
