'use client';

import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { UserProfile } from './users';

export const updateUserSettings = (
    firestore: Firestore, 
    userId: string, 
    settings: Partial<UserProfile> | { [key: string]: any }
) => {
    const userRef = doc(firestore, 'users', userId);

    return updateDoc(userRef, settings).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: settings,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw so the calling function can handle it if needed
        throw serverError;
    });
};
