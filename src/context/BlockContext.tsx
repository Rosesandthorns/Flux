'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

interface BlockContextType {
    blockedUserIds: Set<string>;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

export function BlockProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const blockedQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/blockedUsers`);
    }, [user, firestore]);

    const { data: blockedUsers } = useCollection<{userId: string}>(blockedQuery);

    const blockedUserIds = useMemo(() => {
        return new Set(blockedUsers?.map(u => u.userId) || []);
    }, [blockedUsers]);

    return (
        <BlockContext.Provider value={{ blockedUserIds }}>
            {children}
        </BlockContext.Provider>
    );
}

export function useBlock() {
  const context = useContext(BlockContext);
  if (context === undefined) {
    throw new Error('useBlock must be used within a BlockProvider');
  }
  return context;
}
