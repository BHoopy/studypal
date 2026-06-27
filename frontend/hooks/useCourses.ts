'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Course } from '../lib/api';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const deleteCourse = useCallback(async (id: string) => {
    await api.deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const makePublic = useCallback(async (id: string) => {
    const updated = await api.updateCourse(id, { is_public: true });
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
  }, []);

  return { courses, loading, error, refresh, deleteCourse, makePublic };
}

export function usePublicCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listPublicCourses()
      .then(setCourses)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading, error };
}
