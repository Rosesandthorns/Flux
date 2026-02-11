'use client';

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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useUserServers } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import AddServerDialog from '../servers/AddServerDialog';
import { useParams } from 'next/navigation';

export default function ServerRail() {
    const params = useParams();
    const activeServerId = params.serverId as string | undefined;
    const { servers, loading } = useUserServers();
    
    const railContent = (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="/"
                        className={cn(
                            "group relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary",
                            !activeServerId && "bg-primary text-primary-foreground"
                        )}
                    >
                        <Home className="h-6 w-6" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="md:block hidden">
                    <p>Direct Messages</p>
                </TooltipContent>
            </Tooltip>
            <div className="h-8 w-[2px] bg-border" />
            <div className="flex gap-3 pr-2">
                {loading ? (
                    <>
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    </>
                ) : servers.map((server) => (
                <Tooltip key={server.id}>
                    <TooltipTrigger asChild>
                    <Link href={`/channels/${server.id}`} className={cn(
                        "group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full",
                        activeServerId === server.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}>
                        {server.iconURL ? (
                            <Image
                                src={server.iconURL}
                                alt={server.name}
                                fill
                                sizes="48px"
                                className="object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/20">
                                <span className="text-xl font-bold text-primary">{server.name.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="md:block hidden">
                        <p>{server.name}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </div>
             <AddServerDialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                            <button
                                className="group relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="md:block hidden">
                        <p>Add a Server</p>
                    </TooltipContent>
                </Tooltip>
            </AddServerDialog>
            <Sheet>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <button
                            className="group relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                            >
                            <Compass className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="md:block hidden">
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
        </>
    );
    
    return (
        <TooltipProvider delayDuration={0}>
            {/* Mobile Rail */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-sm border-t border-border/50">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex h-16 items-center p-2 gap-3">
                        {railContent}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            
            {/* Desktop Rail */}
            <div className="hidden md:block group pointer-events-none fixed bottom-0 left-0 right-0 z-10 h-24">
                <div className="flex h-full items-center justify-center">
                    <div className="pointer-events-auto flex transform-gpu items-center gap-3 rounded-full border border-border/50 bg-background/50 p-2 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 opacity-0 translate-y-8">
                       {railContent}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
