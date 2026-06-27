import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function parseServiceAccount(raw: string): ServiceAccount | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed) as ServiceAccount;
  } catch {
    // Some .env files store escaped newlines as literal \\n in the private key.
    try {
      return JSON.parse(trimmed.replace(/\\n/g, '\n')) as ServiceAccount;
    } catch {
      return undefined;
    }
  }
}

function getServiceAccount(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;
  return parseServiceAccount(raw);
}

export function isFirebaseConfigured(): boolean {
  return Boolean(getServiceAccount());
}

function initFirebase() {
  if (getApps().length > 0) return;

  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
    return;
  }

  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY is not set or is invalid. ' +
      'Provide a valid Firebase service account JSON string in the .env file.'
  );
}

let firebaseAuth: ReturnType<typeof getAuth> | null = null;

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    initFirebase();
    firebaseAuth = getAuth();
  }
  return firebaseAuth;
}
