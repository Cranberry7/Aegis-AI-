import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

export type UserCredentials = z.infer<typeof userSchema>;
