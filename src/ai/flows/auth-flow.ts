'use server';
/**
 * @fileOverview Mock flows for handling user authentication (signup and login).
 *
 * - signupUser - A function to simulate user registration.
 * - loginUser - A function to simulate user login.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  storeName: z.string(),
});

// Mock user database. In a real app, use a proper database like Firestore.
const mockUserDatabase: any[] = [
    {
        name: 'Test User',
        storeName: 'Test Store',
        email: 'test@example.com',
        password: 'password',
    }
];

const SignupInputSchema = UserSchema.extend({
  password: z.string(),
});

const AuthOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema.optional(),
});


export async function signupUser(
  input: z.infer<typeof SignupInputSchema>
): Promise<z.infer<typeof AuthOutputSchema>> {
  return signupUserFlow(input);
}

const signupUserFlow = ai.defineFlow(
  {
    name: 'signupUserFlow',
    inputSchema: SignupInputSchema,
    outputSchema: AuthOutputSchema,
  },
  async (input) => {
    // Check if user already exists
    if (mockUserDatabase.find(user => user.email === input.email)) {
      return {
        success: false,
        message: 'A user with this email already exists.',
      };
    }
    
    // In a real app, you would hash the password here before saving.
    // For this mock, we're storing it in-memory.
    mockUserDatabase.push(input);
    
    console.log('New user signed up:', input.email);
    console.log('Current users:', mockUserDatabase.map(u => u.email));

    return {
      success: true,
      message: 'User created successfully.',
    };
  }
);


const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginUser(
  input: z.infer<typeof LoginInputSchema>
): Promise<z.infer<typeof AuthOutputSchema>> {
  return loginUserFlow(input);
}

const loginUserFlow = ai.defineFlow(
  {
    name: 'loginUserFlow',
    inputSchema: LoginInputSchema,
    outputSchema: AuthOutputSchema,
  },
  async ({ email, password }) => {
    const user = mockUserDatabase.find(user => user.email === email);
    
    if (!user) {
      return {
        success: false,
        message: 'No user found with this email address.',
      };
    }
    
    // In a real app, you'd compare hashed passwords.
    if (user.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please try again.',
      };
    }

    console.log('User logged in:', user.email);

    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful.',
      user: userWithoutPassword,
    };
  }
);
