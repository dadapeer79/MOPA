'use server';
/**
 * @fileOverview A flow for creating a new mock invoice.
 *
 * - createInvoice - A function that handles creating and saving a new invoice.
 */

import { ai } from '@/ai/genkit';
import { addMockInvoice } from '@/services/invoices';
import { z } from 'zod';

const InvoiceItemSchema = z.object({
  name: z.string().describe('The name of the product.'),
  quantity: z.number().describe('The quantity of the product.'),
  price: z.number().describe('The price per unit of the product.'),
  total: z.number().describe('The total price for this line item.'),
});

const CreateInvoiceInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerAddress: z.string().describe('The billing address of the customer.'),
  issueDate: z.string().describe('The issue date of the invoice in ISO format.'),
  dueDate: z.string().describe('The due date of the invoice in ISO format.'),
  items: z.array(InvoiceItemSchema).describe('The list of items on the invoice.'),
});

const InvoiceSchema = CreateInvoiceInputSchema.extend({
    id: z.string().describe('The invoice ID.'),
    amount: z.number().describe('The total invoice amount.'),
    status: z.string().describe('The status of the invoice (e.g., Paid, Unpaid, Overdue).'),
    subtotal: z.number().describe('The subtotal before taxes.'),
    tax: z.number().describe('The tax amount.'),
});


export async function createInvoice(
  input: z.infer<typeof CreateInvoiceInputSchema>
): Promise<z.infer<typeof InvoiceSchema>> {
  return createInvoiceFlow(input);
}

const createInvoiceFlow = ai.defineFlow(
  {
    name: 'createInvoiceFlow',
    inputSchema: CreateInvoiceInputSchema,
    outputSchema: InvoiceSchema,
  },
  async (invoiceData) => {
    const newInvoice = await addMockInvoice(invoiceData);
    return newInvoice;
  }
);
