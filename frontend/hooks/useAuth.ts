'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getCurrentUser, type AuthUser } from '../lib/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refreshUser = async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;

      if (!currentUser) {
        setUser(null);
        router.replace('/login');
      } else {
        setUser(currentUser);
      }

      setLoading(false);
    };

    void refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refreshUser();
    });

    const unsubscribeFirebase = isFirebaseConfigured()
      ? onAuthStateChanged(getFirebaseAuth(), () => {
          void refreshUser();
        })
      : undefined;

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      unsubscribeFirebase?.();
    };
  }, [router]);

  return { user, loading };
}
