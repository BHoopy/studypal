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

  return { courses, loading, error, refresh, deleteCourse };
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
