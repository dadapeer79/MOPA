'use server';

import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const ai = googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Input schema for voice transaction
const VoiceTransactionInput = z.object({
  transcript: z.string().describe('The voice transcript from user'),
  language: z.string().optional().describe('Language code like en-IN, hi-IN'),
});

// Output schema
const VoiceTransactionOutput = z.object({
  description: z.string().describe('Person name or transaction description'),
  amount: z.number().describe('Transaction amount in rupees'),
  type: z.enum(['expense', 'income']).describe('Type of transaction'),
  confidence: z.number().describe('Confidence level 0-1'),
  explanation: z.string().describe('Explanation of parsing'),
});

export const parseVoiceTransactionFlow = defineFlow(
  {
    name: 'parseVoiceTransaction',
    inputType: VoiceTransactionInput,
    outputType: VoiceTransactionOutput,
  },
  async (input) => {
    const prompt = `
You are a voice transaction parser for an Indian retail finance app. Analyze this voice input and extract transaction details.

Voice Input: "${input.transcript}"

Rules:
1. Extract DESCRIPTION (person name, store name, or item)
2. Extract AMOUNT (number in rupees, handle variations like "250", "two fifty", etc)
3. Determine TYPE (expense or income):
   - EXPENSE keywords: sent, paid, paid to, gave, purchased, bought, expense, cost, spent, out, transfer
   - INCOME keywords: received, got, income, revenue, earned, received from, payment, credited, money in

Hindi variations:
- भेजा (sent/paid in Hindi)
- पाया (received in Hindi)
- खर्च (expense in Hindi)

Return a JSON object with:
{
  "description": "extracted name/item",
  "amount": number,
  "type": "expense" or "income",
  "confidence": 0.0-1.0,
  "explanation": "brief explanation of extraction"
}

Examples:
- "राजू को २५० रुपये भेजे" → {"description": "raju", "amount": 250, "type": "expense", ...}
- "अमित से ५०० रुपये पाए" → {"description": "amit", "amount": 500, "type": "income", ...}
- "store को 1000 rupees paid" → {"description": "store", "amount": 1000, "type": "expense", ...}
`;

    try {
      const response = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt,
      });

      // Extract JSON from response
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        description: parsed.description || 'Unknown',
        amount: parsed.amount || 0,
        type: parsed.type === 'income' ? 'income' : 'expense',
        confidence: parsed.confidence || 0.8,
        explanation: parsed.explanation || 'Parsed using AI',
      };
    } catch (error) {
      console.error('Voice parsing error:', error);
      
      // Fallback to keyword-based parsing if AI fails
      const transcript = input.transcript.toLowerCase();
      
      let type: 'expense' | 'income' = 'expense';
      const expenseKeywords = ['sent', 'paid', 'gave', 'purchased', 'bought', 'expense', 'cost', 'spent', 'भेजा', 'खर्च'];
      const incomeKeywords = ['received', 'got', 'income', 'revenue', 'earned', 'credited', 'पाया'];
      
      if (incomeKeywords.some(k => transcript.includes(k))) {
        type = 'income';
      } else if (expenseKeywords.some(k => transcript.includes(k))) {
        type = 'expense';
      }
      
      // Extract amount
      const amountMatch = transcript.match(/(\d+)/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
      
      // Extract description (first word or before amount)
      const words = transcript.split(/\s+/);
      const description = words[0] || 'Unknown';
      
      return {
        description,
        amount,
        type,
        confidence: 0.6,
        explanation: 'Parsed using keyword fallback (AI unavailable)',
      };
    }
  }
);

export default parseVoiceTransactionFlow;
