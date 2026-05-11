'use server';
/**
 * @fileOverview Mock flows for sending and verifying OTPs for email updates.
 *
 * - sendOtp - A function that simulates sending an OTP to an email.
 * - verifyOtp - A function that simulates verifying an OTP.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OtpOutputSchema = z.object({
  otp: z.string().describe('The one-time password.'),
});

// Mock storage for the generated OTP. In a real app, use a secure cache like Redis.
let mockOtpStorage: { [email: string]: string } = {};

export async function sendOtp(email: string): Promise<z.infer<typeof OtpOutputSchema>> {
  return sendOtpFlow(email);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: z.string(),
    outputSchema: OtpOutputSchema,
  },
  async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockOtpStorage[email] = otp;

    console.log(`Sending OTP ${otp} to ${email}`); // Simulate sending email

    // In a real scenario, you would integrate with an email service here.
    // For this mock, we return the OTP so it can be displayed in an alert.
    return { otp };
  }
);


const VerifyOtpInputSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function verifyOtp(input: z.infer<typeof VerifyOtpInputSchema>): Promise<boolean> {
  return verifyOtpFlow(input);
}

const verifyOtpFlow = ai.defineFlow(
  {
    name: 'verifyOtpFlow',
    inputSchema: VerifyOtpInputSchema,
    outputSchema: z.boolean(),
  },
  async ({ email, otp }) => {
    const storedOtp = mockOtpStorage[email];

    if (storedOtp && storedOtp === otp) {
      delete mockOtpStorage[email]; // OTP is used, so delete it
      return true;
    }
    
    return false;
  }
);
