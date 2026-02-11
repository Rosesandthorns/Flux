"use client";

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Server } from '@/firebase/servers/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function ExploreServers() {
    const firestore = useFirestore();
    const serversQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'servers'), where('featured', '==', true));
    }, [firestore]);

    const { data: featuredServers, loading } = useCollection<Server>(serversQuery);

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
        return (
          <Card key={server.id} className="overflow-hidden hover:border-primary transition-colors group">
            <div className="relative h-40 w-full">
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
              <CardDescription>A featured server you can join.</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
