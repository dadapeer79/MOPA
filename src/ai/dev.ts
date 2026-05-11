import { config } from 'dotenv';
config();

import '@/ai/flows/product-procurement-suggestions.ts';
import '@/ai/tools/upi-tools.ts';
import '@/ai/flows/get-recent-transactions-flow.ts';
import '@/ai/flows/get-sales-data-flow.ts';
import '@/ai/flows/otp-flow.ts';
import '@/ai/flows/auth-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/get-invoices-flow.ts';
import '@/ai/flows/create-invoice-flow.ts';
import '@/ai/flows/delete-invoice-flow.ts';
import '@/ai/flows/update-invoice-status-flow.ts';
import '@/ai/flows/get-expenses-flow.ts';
import '@/ai/flows/create-expense-flow.ts';
import '@/ai/flows/delete-expense-flow.ts';
import '@/ai/flows/business-insights-flow.ts';
