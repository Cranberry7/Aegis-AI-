import { infer as zInfer } from 'zod';
import { loginCredentialSchema } from '../schemas/authProvider';

export type ILoginCredentials = zInfer<typeof loginCredentialSchema>;

export interface IUserProfile {
  name?: string;
  nextLoginDate?: string | Date;
  isEmailVerified?: boolean;
  email?: string;
  id?: string;
  account?: {
    id?: string;
    name?: string;
  };
  avatar?: string;
}
