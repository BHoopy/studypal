-- Run this in the Supabase SQL editor AFTER 001_init.sql

-- ── Courses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,               -- "Information Literacy"
  code        TEXT        NOT NULL,               -- "INF 101"
  level       TEXT        NOT NULL,               -- "Level 100"
  description TEXT,
  is_public   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_user   ON courses (user_id);
CREATE INDEX IF NOT EXISTS idx_courses_public ON courses (is_public) WHERE is_public = true;

-- Auto-bump updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS courses_set_updated_at ON courses;
CREATE TRIGGER courses_set_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Link documents → courses ──────────────────────────────────────────────────
ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_course ON documents (course_id);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Owners can do everything
CREATE POLICY "courses_owner_all"    ON courses FOR ALL    USING (auth.uid() = user_id);
-- Everyone can read public courses
CREATE POLICY "courses_public_read"  ON courses FOR SELECT USING (is_public = true);

-- Documents in public courses are readable by everyone
CREATE POLICY "documents_public_course_read" ON documents
  FOR SELECT USING (
    course_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM courses WHERE id = documents.course_id AND is_public = true)
  );

-- Chunks that belong to documents in public courses are readable by everyone
CREATE POLICY "chunks_public_course_read" ON chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN courses c ON c.id = d.course_id
      WHERE d.id = chunks.document_id AND c.is_public = true
    )
  );
