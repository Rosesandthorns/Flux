'use client';
import { doc, setDoc, serverTimestamp, type Firestore, deleteDoc, collection, where, getDocs, query } from 'firebase/firestore';
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
    status: 'owner' | 'admin' | 'user';
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

export const deleteUserDocument = (firestore: Firestore, userId: string) => {
    const userRef = doc(firestore, 'users', userId);
    // This performs a "soft delete" by removing the user's profile document.
    // It does NOT delete their Firebase Auth record.
    return deleteDoc(userRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};

export const getUserProfiles = async (firestore: Firestore, userIds: string[]): Promise<Record<string, UserProfile>> => {
    const profiles: Record<string, UserProfile> = {};
    if (!userIds || userIds.length === 0) {
        return profiles;
    }

    // Firestore 'in' queries are limited to 30 items.
    const chunks = [];
    for (let i = 0; i < userIds.length; i += 30) {
        chunks.push(userIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            profiles[doc.id] = { id: doc.id, ...doc.data() } as UserProfile;
        });
    }

    return profiles;
};

    