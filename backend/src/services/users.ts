import { pool } from '../db/client';

/** Ensure a user row exists (Supabase UUID or Firebase UID). */
export async function ensureUser(id: string, email: string): Promise<void> {
  await pool.query(
    `INSERT INTO users (id, email)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
    [id, email]
  );
}
