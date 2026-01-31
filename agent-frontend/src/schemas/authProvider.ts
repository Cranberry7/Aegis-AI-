import { object, string } from 'zod';

export const loginCredentialSchema = object({
  email: string().email(),
  password: string().min(5),
});
