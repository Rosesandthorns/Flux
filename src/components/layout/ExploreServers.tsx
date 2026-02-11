"use client";

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useUser, joinServer } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Server } from '@/firebase/servers/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ExploreServers() {
    const firestore = useFirestore();
    const serversQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'servers'), where('featured', '==', true));
    }, [firestore]);

    const { data: featuredServers, loading } = useCollection<Server>(serversQuery);
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [joiningServerId, setJoiningServerId] = useState<string | null>(null);

    const handleJoin = async (server: Server) => {
        if (!firestore || !user || !server.id || !server.inviteCode) return;
        if (joiningServerId) return;

        setJoiningServerId(server.id);
        try {
            const joinedServerId = await joinServer(firestore, user, server.inviteCode);
             if (joinedServerId) {
                toast({
                    title: 'Server Joined!',
                    description: `You have successfully joined ${server.name}.`,
                });
                router.push(`/channels/${joinedServerId}`);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error joining server',
                description: error.message,
            });
        } finally {
            setJoiningServerId(null);
        }
    };


    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
  
    if (!featuredServers || featuredServers.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <h2 className="text-2xl font-semibold">No servers to explore</h2>
                    <p>Check back later for public servers to join.</p>
                </div>
            </div>
        );
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {featuredServers.map((server) => {
        const isJoining = joiningServerId === server.id;
        return (
          <Card 
            key={server.id} 
            className={cn(
                "overflow-hidden hover:border-primary transition-colors group",
                isJoining ? 'cursor-wait opacity-70' : 'cursor-pointer'
            )}
            onClick={() => handleJoin(server)}
          >
            <div className="relative h-40 w-full">
              {isJoining && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {server.iconURL ? (
                <Image
                  src={server.iconURL}
                  alt={server.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/20">
                    <span className="text-4xl font-bold text-primary">{server.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{server.name}</CardTitle>
              <CardDescription>Click to join this featured server.</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
