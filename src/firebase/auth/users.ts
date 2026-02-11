'use client';
import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type UserProfile = {
    handle: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: any; // serverTimestamp()
    status: string;
};

export const createUserProfile = (firestore: Firestore, userId: string, email: string, username: string) => {
    const userRef = doc(firestore, 'users', userId);
    const data: UserProfile = {
        email,
        displayName: username,
        handle: `${username.toLowerCase()}@flux`,
        createdAt: serverTimestamp(),
        status: 'user',
        photoURL: `https://picsum.photos/seed/${userId}/400/400`,
    };

    return setDoc(userRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the original error so the calling function knows about it
        throw serverError;
    });
};
