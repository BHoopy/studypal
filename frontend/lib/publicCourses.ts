import { supabase } from './supabase';
import type { Course, Document, PublicCourse } from './api';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}


/** Anonymous browse via Supabase RLS (courses_public_read). Used when the API is unavailable. */
export async function listPublicCoursesFromSupabase(): Promise<Course[]> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, code, level, description, is_public, created_at, updated_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!courses?.length) return [];

  const courseIds = courses.map(c => c.id);
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('course_id, status')
    .in('course_id', courseIds);

  if (docsError) throw new Error(docsError.message);

  const docCounts = new Map<string, number>();
  for (const doc of docs ?? []) {
    if (doc.status === 'ready') {
      docCounts.set(doc.course_id, (docCounts.get(doc.course_id) ?? 0) + 1);
    }
  }

  return courses.map(c => ({
    ...c,
    is_public: true,
    doc_count: docCounts.get(c.id) ?? 0,
  }));
}

export async function getPublicCourseFromSupabase(id: string): Promise<PublicCourse> {
  const { data: course, error } = await supabase
    .from('courses')
    .select('id, title, code, level, description, is_public, created_at, updated_at, user_id')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!course) throw new Error('Course not found');

  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('id, name, file_type, status, page_count, word_count, created_at, course_id')
    .eq('course_id', id)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  if (docsError) throw new Error(docsError.message);

  return {
    ...course,
    is_public: true,
    doc_count: (documents ?? []).length,
    documents: (documents ?? []) as Document[],
  };
}
