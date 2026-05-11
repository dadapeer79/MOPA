'use server';
/**
 * @fileOverview A flow for deleting a mock invoice.
 *
 * - deleteInvoice - A function that handles deleting an invoice by its ID.
 */

import { ai } from '@/ai/genkit';
import { deleteMockInvoice } from '@/services/invoices';
import { z } from 'zod';

const DeleteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});


export async function deleteInvoice(
  invoiceId: string
): Promise<z.infer<typeof DeleteOutputSchema>> {
  return deleteInvoiceFlow(invoiceId);
}

const deleteInvoiceFlow = ai.defineFlow(
  {
    name: 'deleteInvoiceFlow',
    inputSchema: z.string(),
    outputSchema: DeleteOutputSchema,
  },
  async (invoiceId) => {
    return await deleteMockInvoice(invoiceId);
  }
);
