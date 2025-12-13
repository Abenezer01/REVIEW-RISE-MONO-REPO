import jwt from 'jsonwebtoken';
import { getUserRoles } from './rbac';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const JWT_EXPIRES_IN = '1d';

export interface TokenPayload {
  userId: string;
  email: string;
  roles?: Record<string, string[]>; // businessId -> roles[]
  [key: string]: any;
}

export async function generateToken(user: { id: string; email: string }) {
  const roles = await getUserRoles(user.id);
  
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    roles,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
