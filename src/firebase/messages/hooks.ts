'use client';
import { useFirestore } from '../provider';
import { useCollection } from '../firestore/use-collection';
import { collection, query, orderBy, limit, type Query } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Message } from './types';

export function useMessages(conversationId: string | null) {
  const firestore = useFirestore();

  const messagesQuery = useMemo(() => {
    if (!firestore || !conversationId) return null;
    return query(
      collection(firestore, `dms/${conversationId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    ) as Query<Message>;
  }, [firestore, conversationId]);

  const { data, loading, error } = useCollection<Message>(messagesQuery);
  
  // The data is fetched in descending order for query efficiency (getting latest),
  // but we want to display it in ascending order.
  const messages = useMemo(() => data?.slice().reverse() ?? [], [data]);

  return { messages, loading, error };
}
