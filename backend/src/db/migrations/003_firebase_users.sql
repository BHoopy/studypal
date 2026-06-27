-- Support Firebase auth user IDs (non-UUID strings) alongside Supabase users.
-- Run in the Supabase SQL editor AFTER 001_init.sql and 002_courses.sql.

DROP POLICY IF EXISTS "users_own" ON users;
DROP POLICY IF EXISTS "documents_own" ON documents;
DROP POLICY IF EXISTS "chunks_own" ON chunks;
DROP POLICY IF EXISTS "sessions_own" ON chat_sessions;
DROP POLICY IF EXISTS "messages_own" ON messages;
DROP POLICY IF EXISTS "courses_owner_all" ON courses;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE chunks DROP CONSTRAINT IF EXISTS chunks_user_id_fkey;
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_user_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE documents ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE chunks ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE chat_sessions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE courses ALTER COLUMN user_id TYPE TEXT USING user_id::text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id::text, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE documents
  ADD CONSTRAINT documents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chunks
  ADD CONSTRAINT chunks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_sessions
  ADD CONSTRAINT chat_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE courses
  ADD CONSTRAINT courses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid()::text = id);
CREATE POLICY "documents_own" ON documents FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "chunks_own" ON chunks FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "sessions_own" ON chat_sessions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "messages_own" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = messages.session_id AND user_id = auth.uid()::text
    )
  );
CREATE POLICY "courses_owner_all" ON courses FOR ALL USING (auth.uid()::text = user_id);
