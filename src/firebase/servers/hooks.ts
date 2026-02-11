'use client';

import { useMemo } from 'react';
import { useUser } from '../auth/use-user';
import { useFirestore } from '../provider';
import { collection, query, where, orderBy, type Query, doc } from 'firebase/firestore';
import { useCollection, useDoc } from '../firestore';
import type { Server, Channel, ServerMember, ServerMessage } from './types';


// Hook to get all servers a user is a member of
export function useUserServers() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }

        // This is not efficient for production, as it queries all servers.
        // A better approach would be to store a list of server memberships on the user object,
        // but for this prototype, this is simpler to implement.
        const unsubscribe = onSnapshot(collection(firestore, 'servers'), async (snapshot) => {
            const userServers: Server[] = [];
            for (const serverDoc of snapshot.docs) {
                const memberRef = doc(firestore, `servers/${serverDoc.id}/members/${user.uid}`);
                const memberSnap = await getDoc(memberRef);
                if (memberSnap.exists()) {
                    userServers.push({ id: serverDoc.id, ...serverDoc.data() } as Server);
                }
            }
            setServers(userServers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user servers:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user, firestore]);
    
    // A quick hack to import useState and useEffect without rewriting the whole hook
    const [_,__] = useState();
    useEffect(() => {}, [])

    return { servers, loading };
}


// Hook to get a single server's data
export function useServer(serverId: string) {
    const firestore = useFirestore();
    const serverRef = useMemo(() => {
        if (!firestore || !serverId) return null;
        return doc(firestore, 'servers', serverId) as DocumentReference<Server>;
    }, [firestore, serverId]);

    return useDoc<Server>(serverRef);
}


// Hook to get a server's channels
export function useServerChannels(serverId: string) {
    const firestore = useFirestore();

    const channelsQuery = useMemo(() => {
        if (!firestore || !serverId) return null;
        return query(
            collection(firestore, `servers/${serverId}/channels`),
            orderBy('name', 'asc')
        ) as Query<Channel>;
    }, [firestore, serverId]);

    const { data: channels, loading, error } = useCollection<Channel>(channelsQuery);

    return { channels, loading, error };
}

// Hook to get messages from a server channel
export function useServerMessages(serverId: string, channelId: string) {
  const firestore = useFirestore();

  const messagesQuery = useMemo(() => {
    if (!firestore || !serverId || !channelId) return null;
    return query(
      collection(firestore, `servers/${serverId}/channels/${channelId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    ) as Query<ServerMessage>;
  }, [firestore, serverId, channelId]);

  const { data, loading, error } = useCollection<ServerMessage>(messagesQuery);
  
  const messages = useMemo(() => data?.slice().reverse() ?? [], [data]);

  return { messages, loading, error };
}

// Dummy imports to satisfy the type checker in the generated code
import { useState, useEffect } from 'react';
import { onSnapshot, getDoc, limit, DocumentReference } from 'firebase/firestore';

