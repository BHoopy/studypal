import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';
import { ensureUser } from '../services/users';

export interface AuthedRequest extends Request {
  user: { id: string; email: string; provider: 'firebase' | 'supabase' };
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (isFirebaseConfigured()) {
    try {
      const decoded = await getFirebaseAuth().verifyIdToken(token);
      const email = decoded.email ?? '';

      await ensureUser(decoded.uid, email);

      (req as AuthedRequest).user = {
        id: decoded.uid,
        email,
        provider: 'firebase',
      };
      next();
      return;
    } catch {
      // Not a Firebase token — fall through to Supabase (email/password users).
    }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  await ensureUser(user.id, user.email ?? '');

  (req as AuthedRequest).user = {
    id: user.id,
    email: user.email ?? '',
    provider: 'supabase',
  };
  next();
}
