'use server';

/**
 * @fileOverview An AI agent that provides product procurement suggestions for retailers.
 *
 * - getProductProcurementSuggestions - A function that provides product procurement suggestions.
 * - ProductProcurementSuggestionsInput - The input type for the getProductProcurementSuggestions function.
 * - ProductProcurementSuggestionsOutput - The return type for the getProductProcurementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ProductProcurementSuggestionsInputSchema = z.object({
  currentInventory: z
    .number()
    .describe('The current quantity of the product in stock.'),
  reorderPoint: z
    .number()
    .describe(
      'The minimum quantity of the product that should be in stock before reordering.'
    ),
  salesVelocity: z
    .number()
    .describe(
      'The average number of units of the product sold per day over the past month.'
    ),
  leadTimeDays: z
    .number()
    .describe(
      'The number of days it takes for a new order of the product to arrive after it is placed.'
    ),
  productName: z.string().describe('The name of the product.'),
  safetyStockDays: z
    .number()
    .optional()
    .describe(
      'The number of days of sales to keep in safety stock to buffer against unexpected demand spikes. Defaults to 7 days if not specified.'
    ),
  language: z.enum(['en', 'hi', 'kn']).describe('The language for the response (en, hi, or kn).'),
});
export type ProductProcurementSuggestionsInput = z.infer<
  typeof ProductProcurementSuggestionsInputSchema
>;

const ProductProcurementSuggestionsOutputSchema = z.object({
  suggestedOrderQuantity: z
    .number()
    .describe(
      'The suggested quantity of the product to order, based on the provided inputs.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested order quantity, including how the inputs were used in the calculation.'
    ),
  inventoryRunoutDays: z
    .number()
    .describe('The estimated number of days the current inventory will last.'),
  suggestedApps: z
    .array(z.string())
    .describe(
      'A list of suggested apps or platforms where the product might be available at a low cost.'
    ),
});
export type ProductProcurementSuggestionsOutput = z.infer<
  typeof ProductProcurementSuggestionsOutputSchema
>;

export async function getProductProcurementSuggestions(
  input: ProductProcurementSuggestionsInput
): Promise<ProductProcurementSuggestionsOutput> {
  return productProcurementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productProcurementSuggestionsPrompt',
  input: {schema: ProductProcurementSuggestionsInputSchema},
  output: {schema: ProductProcurementSuggestionsOutputSchema},
  prompt: `You are an expert retail inventory manager. Your goal is to provide a retailer with the optimal order quantity for a given product, based on current inventory levels, sales velocity, reorder point, and lead time.

  Respond entirely in the following language: {{{language}}} (en=English, hi=Hindi, kn=Kannada).

  Here are the details for the product: 
  Product Name: {{{productName}}}
  Current Inventory: {{{currentInventory}}} units
  Reorder Point: {{{reorderPoint}}} units
  Sales Velocity: {{{salesVelocity}}} units per day
  Lead Time: {{{leadTimeDays}}} days

  You should also consider safety stock to buffer against unexpected demand spikes. If the safetyStockDays is specified, calculate the safety stock. Otherwise assume it is 7 days. 

  Based on this information, you need to provide the following:
  1.  Calculate the suggested order quantity. This should ensure the retailer does not run out of stock while minimizing excess inventory. If current inventory is above the reorder point, the suggested quantity should be 0.
  2.  Explain your reasoning clearly.
  3.  Calculate how many days the current inventory will last based on the sales velocity (inventoryRunoutDays). If sales velocity is 0, this should be a very large number.
  4.  Suggest a few online apps or platforms where the user can find this product at a low cost. Include popular Indian apps like Zepto, Flipkart, and Blinkit in your suggestions.

  Here are some formulas that might be helpful:
  - Inventory Runout Days = Current Inventory / Sales Velocity
  - Reorder Point = (Lead Time Demand) + (Safety Stock)
  - Lead Time Demand = Sales Velocity * Lead Time (in days)
  - Safety Stock = Sales Velocity * Safety Stock (in days)
  - The final order quantity should take into account the current inventory level.

  Be sure to use these units in your calculations:
  - suggestedOrderQuantity should be in units
  - inventoryRunoutDays should be in days
  - safetyStockDays should be in days
  - leadTimeDays should be in days
  - salesVelocity should be in units per day
  - currentInventory should be in units
  - reorderPoint should be in units
  `,
});

const productProcurementSuggestionsFlow = ai.defineFlow(
  {
    name: 'productProcurementSuggestionsFlow',
    inputSchema: ProductProcurementSuggestionsInputSchema,
    outputSchema: ProductProcurementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = (await prompt(input))!;
    return output!;
  }
);
