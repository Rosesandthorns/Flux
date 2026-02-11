'use client';

import { useUser } from './use-user';
import { useFirestore } from '../provider';
import { doc, type DocumentReference } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';
import { useMemo } from 'react';
import type { UserProfile } from './users';

export function useUserProfile() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user?.uid || !firestore) return null;
        return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
    }, [user?.uid, firestore]);

    return useDoc<UserProfile>(userDocRef);
}
