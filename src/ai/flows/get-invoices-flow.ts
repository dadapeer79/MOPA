'use server';
/**
 * @fileOverview A flow for retrieving mock invoice data.
 *
 * - getInvoices - A function that handles fetching invoices.
 * - Invoice - The type for a single invoice.
 */

import { ai } from '@/ai/genkit';
import { getMockInvoices } from '@/services/invoices';
import { z } from 'zod';

const InvoiceItemSchema = z.object({
  name: z.string().describe('The name of the product.'),
  quantity: z.number().describe('The quantity of the product.'),
  price: z.number().describe('The price per unit of the product.'),
  total: z.number().describe('The total price for this line item.'),
});

const InvoiceSchema = z.object({
  id: z.string().describe('The invoice ID.'),
  customerName: z.string().describe('The name of the customer.'),
  customerAddress: z.string().describe('The billing address of the customer.'),
  amount: z.number().describe('The total invoice amount.'),
  status: z.string().describe('The status of the invoice (e.g., Paid, Unpaid, Overdue).'),
  issueDate: z.string().describe('The issue date of the invoice in ISO format.'),
  dueDate: z.string().describe('The due date of the invoice in ISO format.'),
  items: z.array(InvoiceItemSchema).describe('The list of items on the invoice.'),
  subtotal: z.number().describe('The subtotal before taxes.'),
  tax: z.number().describe('The tax amount.'),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export async function getInvoices(): Promise<Invoice[]> {
  return getInvoicesFlow();
}

const getInvoicesFlow = ai.defineFlow(
  {
    name: 'getInvoicesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(InvoiceSchema),
  },
  async () => {
    return await getMockInvoices();
  }
);
