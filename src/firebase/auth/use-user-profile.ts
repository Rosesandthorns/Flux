'use client';

import { useUser } from './use-user';
import { useFirestore } from '../provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';
import { useMemo } from 'react';

export function useUserProfile() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user?.uid || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user?.uid, firestore]);

    return useDoc(userDocRef);
}
