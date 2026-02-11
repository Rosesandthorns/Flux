'use client';
import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Theme } from '@/context/ThemeContext';

export type UserProfile = {
    id?: string;
    handle: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: any;
    profileLastUpdatedAt: any;
    status: string;
    theme: Theme;
    privacy: {
        whoCanDm: 'anyone' | 'friends';
        whoCanAdd: 'anyone' | 'mutual' | 'fof' | 'none';
    };
    notifications: {
        friendRequests: boolean;
        mentions: boolean;
        dms: boolean;
    };
};

export const createUserProfile = (firestore: Firestore, userId: string, email: string, username: string) => {
    const userRef = doc(firestore, 'users', userId);
    const data: Omit<UserProfile, 'id'> = {
        email,
        displayName: username,
        handle: `${username.toLowerCase()}@flux`,
        createdAt: serverTimestamp(),
        profileLastUpdatedAt: serverTimestamp(),
        status: 'user',
        photoURL: `https://picsum.photos/seed/${userId}/400/400`,
        theme: 'default',
        privacy: {
            whoCanDm: 'anyone',
            whoCanAdd: 'anyone',
        },
        notifications: {
            friendRequests: true,
            mentions: true,
            dms: false,
        },
    };

    return setDoc(userRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};
