"use client";

import { Home, Plus, Compass, X } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import {
    Sheet,
    SheetContent,
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
        <div className="group fixed inset-x-0 bottom-0 z-50 flex h-24 items-end justify-center pointer-events-none">
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
                        <p>Server {index + 1}</p>
                        </TooltipContent>
                    </Tooltip>
                    ))}
                    <ServerButton tooltip="Add a Server">
                        <Plus className="h-6 w-6" />
                    </ServerButton>
                    <Drawer>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DrawerTrigger asChild>
                                    <button
                                    className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                                    >
                                    <Compass className="h-6 w-6" />
                                    </button>
                                </DrawerTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Explore Servers</p>
                            </TooltipContent>
                        </Tooltip>
                        <DrawerContent className="h-full max-h-screen top-0 mt-0 rounded-none flex flex-col">
                           <DrawerHeader className="p-6 pb-2 text-center">
                                <DrawerTitle className="text-2xl font-bold">Explore Public Servers</DrawerTitle>
                                <DrawerDescription>Find your next community. Here are some popular servers to get you started.</DrawerDescription>
                            </DrawerHeader>
                            <ScrollArea className="flex-1">
                                <div className="p-6 pt-2">
                                    <ExploreServers />
                                </div>
                            </ScrollArea>
                            <DrawerClose asChild className="absolute top-4 right-4">
                              <Button variant="ghost" size="icon">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                              </Button>
                            </DrawerClose>
                        </DrawerContent>
                    </Drawer>
                </div>
            </nav>
        </div>
    </TooltipProvider>
    );
}
