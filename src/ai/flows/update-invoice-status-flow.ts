'use server';
/**
 * @fileOverview A flow for updating the status of a mock invoice.
 *
 * - updateInvoiceStatus - A function that handles updating an invoice's status.
 */

import { ai } from '@/ai/genkit';
import { updateMockInvoiceStatus } from '@/services/invoices';
import { z } from 'zod';

const UpdateStatusInputSchema = z.object({
  invoiceId: z.string(),
  newStatus: z.string(),
});

const UpdateStatusOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});


export async function updateInvoiceStatus(
  input: z.infer<typeof UpdateStatusInputSchema>
): Promise<z.infer<typeof UpdateStatusOutputSchema>> {
  return updateInvoiceStatusFlow(input);
}

const updateInvoiceStatusFlow = ai.defineFlow(
  {
    name: 'updateInvoiceStatusFlow',
    inputSchema: UpdateStatusInputSchema,
    outputSchema: UpdateStatusOutputSchema,
  },
  async ({ invoiceId, newStatus }) => {
    return await updateMockInvoiceStatus(invoiceId, newStatus);
  }
);
