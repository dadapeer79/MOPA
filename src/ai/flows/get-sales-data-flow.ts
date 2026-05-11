'use server';
/**
 * @fileOverview A flow for retrieving sales data.
 *
 * - getSalesData - A function that handles fetching sales data for a given time range.
 * - SalesData - The type for a single sales data point.
 */

import { ai } from '@/ai/genkit';
import { getMockSalesData } from '@/services/sales';
import { z } from 'zod';

const SalesDataSchema = z.object({
  date: z.string().describe('The date of the sales data point.'),
  sales: z.number().describe('The total sales for that date.'),
});

export type SalesData = z.infer<typeof SalesDataSchema>;

const TimeRangeSchema = z.enum(['today', 'daily', 'weekly', 'monthly', 'yearly']);

export async function getSalesData(range: z.infer<typeof TimeRangeSchema>): Promise<SalesData[]> {
    return getSalesDataFlow(range);
}

const getSalesDataFlow = ai.defineFlow(
  {
    name: 'getSalesDataFlow',
    inputSchema: TimeRangeSchema,
    outputSchema: z.array(SalesDataSchema),
  },
  async (range) => {
    return await getMockSalesData(range);
  }
);
