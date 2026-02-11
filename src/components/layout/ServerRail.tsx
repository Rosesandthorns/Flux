"use client";

import { Home, Plus, Compass } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import ExploreServers from './ExploreServers';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserServers } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import AddServerDialog from '../servers/AddServerDialog';

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

export default function ServerRail({ activeServerId }: { activeServerId?: string }) {
    const { servers, loading } = useUserServers();
    
    return (
    <TooltipProvider delayDuration={0}>
        <div className="group fixed inset-x-0 bottom-0 z-[60] flex h-24 items-end justify-center pointer-events-none md:pointer-events-auto md:relative md:inset-auto md:h-screen md:w-20 md:flex-col md:items-center md:justify-start md:bg-secondary/30 md:py-4 md:border-r md:border-border/50">
            <nav className="mb-4 transform-gpu transition-all duration-300 ease-in-out opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-auto md:transform-none md:opacity-100 md:flex md:flex-col md:gap-3 md:h-full">
                <div className="flex items-center gap-3 bg-background/50 p-3 backdrop-blur-md rounded-full border border-border/50 shadow-lg md:flex-col md:bg-transparent md:p-0 md:backdrop-blur-none md:rounded-none md:border-none md:shadow-none">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/"
                                className={cn(
                                    "group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary",
                                    !activeServerId && "bg-primary text-primary-foreground"
                                )}
                            >
                                <Home className="h-6 w-6" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Direct Messages</p>
                        </TooltipContent>
                    </Tooltip>
                    <div className="h-8 w-[2px] bg-border md:h-[2px] md:w-8" />
                    <ScrollArea className="flex gap-3 overflow-x-auto no-scrollbar max-w-[10.5rem] md:max-w-none md:flex-col md:overflow-y-auto">
                        <div className="flex gap-3 md:flex-col">
                            {loading ? (
                                <>
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                </>
                            ) : servers.map((server) => (
                            <Tooltip key={server.id}>
                                <TooltipTrigger asChild>
                                <Link href={`/channels/${server.id}`} className={cn(
                                    "group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full",
                                    activeServerId === server.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                )}>
                                    <Image
                                        src={server.iconURL}
                                        alt={server.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
                                    />
                                </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                <p>{server.name}</p>
                                </TooltipContent>
                            </Tooltip>
                            ))}
                        </div>
                    </ScrollArea>
                    <AddServerDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <button
                                    className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                                >
                                    <Plus className="h-6 w-6" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Add a Server</p>
                            </TooltipContent>
                        </Tooltip>
                    </AddServerDialog>
                    <Sheet>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SheetTrigger asChild>
                                    <button
                                    className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                                    >
                                    <Compass className="h-6 w-6" />
                                    </button>
                                </SheetTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Explore Servers</p>
                            </TooltipContent>
                        </Tooltip>
                        <SheetContent showCloseButton={false} side="top" className="h-screen w-screen p-6 flex flex-col">
                           <SheetHeader className="text-center">
                                <SheetTitle>Explore Public Servers</SheetTitle>
                                <SheetDescription>Find your next community. Here are some popular servers to get you started.</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="flex-1 -mx-6 mt-4">
                                <div className="px-6">
                                    <ExploreServers />
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </div>
    </TooltipProvider>
    );
}
