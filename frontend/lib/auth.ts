import { supabase } from './supabase';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  provider: 'firebase' | 'supabase';
}

function fromFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    provider: 'firebase',
  };
}

function fromSupabaseUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    provider: 'supabase',
  };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getFirebaseUser(): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured()) return null;

  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;

  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(
      auth,
      user => {
        unsubscribe();
        resolve(user);
      },
      () => {
        unsubscribe();
        resolve(null);
      }
    );
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const firebaseUser = await getFirebaseUser();
  if (firebaseUser) return fromFirebaseUser(firebaseUser);

  const session = await getSession();
  return session ? fromSupabaseUser(session.user) : null;
}

export async function getAuthToken(): Promise<string | null> {
  const firebaseUser = await getFirebaseUser();
  if (firebaseUser) return firebaseUser.getIdToken();

  const session = await getSession();
  return session?.access_token ?? null;
}

export async function signOut() {
  await Promise.all([
    supabase.auth.signOut(),
    isFirebaseConfigured() ? firebaseSignOut(getFirebaseAuth()) : Promise.resolve(),
  ]);
}
