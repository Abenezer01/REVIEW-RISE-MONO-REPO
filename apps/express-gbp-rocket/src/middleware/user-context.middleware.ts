import { NextFunction, Request, Response } from 'express';

type RequestUser = {
  id: string;
  email?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  return Buffer.from(padded, 'base64').toString('utf8');
};

export const attachUserContext = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      next();

      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const parts = token.split('.');

    if (parts.length < 2) {
      next();

      return;
    }

    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as any;
    const id = payload?.userId || payload?.id;

    if (typeof id === 'string' && id.trim().length > 0) {
      req.user = {
        id,
        ...(typeof payload?.email === 'string' ? { email: payload.email } : {})
      };
    }
  } catch {
    // Ignore parsing errors; endpoints should remain accessible.
  }

  next();
};
