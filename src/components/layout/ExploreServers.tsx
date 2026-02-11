"use client";

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer';

const exploreServers = PlaceHolderImages.filter(img => img.id.startsWith('explore-server-'));

const serverData = [
  { title: "Gamer's Hub", description: 'A community for gamers to connect and play together.', imageId: 'explore-server-1' },
  { title: "Art & Design", description: 'Share your creations and get feedback from fellow artists.', imageId: 'explore-server-2' },
  { title: "Music Lovers", description: 'Discuss your favorite music genres, artists, and albums.', imageId: 'explore-server-3' },
  { title: "Tech Talk", description: 'All things tech, from hardware to software.', imageId: 'explore-server-4' },
  { title: "Book Nook", description: 'A cozy corner for bookworms to discuss their latest reads.', imageId: 'explore-server-5' },
  { title: "Fitness Fanatics", description: 'Stay motivated and share your fitness journey.', imageId: 'explore-server-6' },
  { title: "Movie Buffs", description: 'For cinephiles to discuss films, from blockbusters to indies.', imageId: 'explore-server-1' },
  { title: "Foodies Unite", description: 'Share recipes, restaurant reviews, and culinary adventures.', imageId: 'explore-server-2' },
  { title: "Study Group", description: "Find people to study with.", imageId: "explore-server-3" },
  { title: "Writers' Corner", description: "Share your writing and get feedback.", imageId: "explore-server-4" },
  { title: "Photography", description: "A community for photographers.", imageId: "explore-server-5" },
  { title: "Developers", description: "Talk about code and new technologies.", imageId: "explore-server-6" },
  { title: "Travel Bugs", description: "Share your travel stories and tips.", imageId: "explore-server-1" },
  { title: "DIY & Crafts", description: "A space for all your DIY projects.", imageId: "explore-server-2" },
  { title: "Pet Paradise", description: "For all the animal lovers out there.", imageId: "explore-server-3" },
  { title: "History Buffs", description: "Discuss historical events and figures.", imageId: "explore-server-4" },
];


export default function ExploreServers() {
  return (
    <div className="bg-background text-foreground flex flex-col flex-1" data-vaul-no-drag>
      <div className="shrink-0 p-4 border-b border-border">
        <DrawerTitle className="text-2xl font-bold text-center">Explore Servers</DrawerTitle>
        <DrawerDescription className="text-center">Find your next community.</DrawerDescription>
      </div>
      <div className="overflow-y-auto flex-1">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serverData.map((server, index) => {
            const imageData = exploreServers.find(img => img.id === server.imageId);
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
      </div>
    </div>
  );
}
