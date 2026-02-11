"use client";

import { Home, Plus, Compass } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import ExploreServers from './ExploreServers';
import { ScrollArea } from '@/components/ui/scroll-area';

const servers = PlaceHolderImages.filter(img => img.id.startsWith('server-'));

const ServerButton = ({ children, tooltip }: { children: React.ReactNode; tooltip: string; }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export default function ServerRail() {
    return (
    <TooltipProvider delayDuration={0}>
        <nav
            className="fixed bottom-4 left-1/2 -translate-x-1/2 transform z-50"
        >
            <div className="flex items-center space-x-3 bg-background/50 p-3 backdrop-blur-md rounded-full border border-border/50 shadow-lg">
                <ServerButton tooltip="Direct Messages">
                    <Home className="h-6 w-6" />
                </ServerButton>
                <div className="h-8 w-[2px] bg-border" />
                {servers.map((server, index) => (
                <Tooltip key={server.id}>
                    <TooltipTrigger asChild>
                    <button className="group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                        <Image
                        src={server.imageUrl}
                        alt={server.description}
                        fill
                        sizes="48px"
                        data-ai-hint={server.imageHint}
                        className="object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
                        />
                    </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                    <p>Server {index + 1}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
                <div className="flex-1" />
                <ServerButton tooltip="Add a Server">
                    <Plus className="h-6 w-6" />
                </ServerButton>
                <Dialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <button
                                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                                >
                                <Compass className="h-6 w-6" />
                                </button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Explore Servers</p>
                        </TooltipContent>
                    </Tooltip>
                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-2xl font-bold">Explore Public Servers</DialogTitle>
                            <DialogDescription>Find your next community. Here are some popular servers to get you started.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-6 pt-2">
                               <ExploreServers />
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </nav>
    </TooltipProvider>
    );
}
