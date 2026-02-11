"use client";

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const exploreServers = PlaceHolderImages.filter(img => img.id.startsWith('explore-server-'));

const serverData: { title: string; description: string; imageId: string }[] = [];


export default function ExploreServers() {
  if (serverData.length === 0) {
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
      {serverData.map((server, index) => {
        const imageData = exploreServers.find(img => img.id === server.imageId) || exploreServers[index % exploreServers.length];
        return (
          <Card key={`${server.title}-${index}`} className="overflow-hidden hover:border-primary transition-colors group">
            {imageData && (
              <div className="relative h-40 w-full">
                <Image
                  src={imageData.imageUrl}
                  alt={server.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={imageData.imageHint}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{server.title}</CardTitle>
              <CardDescription>{server.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
