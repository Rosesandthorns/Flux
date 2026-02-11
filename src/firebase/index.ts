import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import FirebaseClientProvider from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUserProfile } from './auth/use-user-profile';
import { updateUserSettings } from './auth/settings';

function initializeFirebase(): { app: FirebaseApp | null; auth: Auth | null; firestore: Firestore | null; } {
    if (typeof window === 'undefined') {
        return { app: null, auth: null, firestore: null };
    }

    if (getApps().length) {
        const app = getApp();
        return { app, auth: getAuth(app), firestore: getFirestore(app) };
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useUser,
  useCollection,
  useDoc,
  useUserProfile,
  updateUserSettings,
};
