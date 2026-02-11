"use client";

import { Home, Plus, Compass } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import ExploreServers from './ExploreServers';
import DirectMessages from './DirectMessages';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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
        <div className="group fixed inset-x-0 bottom-0 z-60 flex h-24 items-end justify-center pointer-events-none">
            <nav className="mb-4 transform-gpu transition-all duration-300 ease-in-out opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-auto">
                <div className="flex items-center space-x-3 bg-background/50 p-3 backdrop-blur-md rounded-full border border-border/50 shadow-lg">
                    <Sheet>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SheetTrigger asChild>
                                    <button
                                        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                                    >
                                        <Home className="h-6 w-6" />
                                    </button>
                                </SheetTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Direct Messages</p>
                            </TooltipContent>
                        </Tooltip>
                        <SheetContent side="top" className="h-screen w-screen p-0 border-none">
                            <SheetHeader className="sr-only">
                              <SheetTitle>Direct Messages</SheetTitle>
                              <SheetDescription>
                                A list of your direct messages and private conversations.
                              </SheetDescription>
                            </SheetHeader>
                            <DirectMessages />
                        </SheetContent>
                    </Sheet>
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
                        <p>{server.description}</p>
                        </TooltipContent>
                    </Tooltip>
                    ))}
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
                        <DialogContent className="max-w-4xl h-3/4 flex flex-col">
                           <DialogHeader>
                                <DialogTitle>Explore Public Servers</DialogTitle>
                                <DialogDescription>Find your next community. Here are some popular servers to get you started.</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-1 -mx-6">
                                <div className="px-6">
                                    <ExploreServers />
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
            </nav>
        </div>
    </TooltipProvider>
    );
}
