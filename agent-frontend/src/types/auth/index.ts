import { RoleCodes } from '@/enums/global.enum';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  account?: {
    id?: string;
    name?: string;
  };
  role?: {
    code?: RoleCodes;
  };
  nextLoginDate?: string | Date;
}
