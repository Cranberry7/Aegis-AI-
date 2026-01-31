import { createHash } from 'crypto';

export function generateHash(content: string) {
  return createHash('sha256').update(content).digest('hex'); // TODO: Add salt and algo from .env
}
