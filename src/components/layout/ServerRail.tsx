'use client';

import { Home, Plus, Compass, Loader2, Users } from 'lucide-react';
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
import { useUserServers, useUser, useFirestore, createServer, joinServer } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function ServerRail() {
    const params = useParams();
    const pathname = usePathname();
    const activeServerId = params.serverId as string | undefined;
    const { servers, loading } = useUserServers();
    const router = useRouter();

    const [addServerOpen, setAddServerOpen] = useState(false);
    const [serverName, setServerName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const handleCreateServer = async () => {
        if (!firestore || !user || !serverName) return;

        setIsCreating(true);
        try {
            const newServerId = await createServer(firestore, user, serverName);
            toast({
                title: 'Server Created!',
                description: `Welcome to ${serverName}.`,
            });
            setAddServerOpen(false);
            setServerName('');
            router.push(`/channels/${newServerId}`);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error creating server',
                description: error.message,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinServer = async () => {
        if (!firestore || !user || !inviteCode) return;
        
        setIsJoining(true);
        try {
            const joinedServerId = await joinServer(firestore, user, inviteCode);
             if (joinedServerId) {
                toast({
                    title: 'Server Joined!',
                    description: 'You have successfully joined the server.',
                });
                setAddServerOpen(false);
                setInviteCode('');
                router.push(`/channels/${joinedServerId}`);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error joining server',
                description: error.message,
            });
        } finally {
            setIsJoining(false);
        }
    };

    const createForm = (
        <form onSubmit={(e) => { e.preventDefault(); handleCreateServer(); }} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="server-name-form" className="text-left">Server Name</Label>
                <Input
                    id="server-name-form"
                    placeholder="Your Awesome Server"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="bg-background/80"
                />
            </div>
            <Button type="submit" disabled={isCreating || !serverName} className="w-full">
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Server
            </Button>
        </form>
    );
    
    const joinForm = (
         <form onSubmit={(e) => { e.preventDefault(); handleJoinServer(); }} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="invite-code-form" className="text-left">Invite Code</Label>
                <Input
                    id="invite-code-form"
                    placeholder="Enter an invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="bg-background/80"
                />
            </div>
            <Button type="submit" disabled={isJoining || !inviteCode} className="w-full">
                {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Server
            </Button>
        </form>
    );

    if (['/login', '/signup'].includes(pathname)) {
        return null;
    }
    
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
             <Sheet open={addServerOpen} onOpenChange={setAddServerOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <button
                                className="group relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all duration-300 ease-in-out hover:bg-primary"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="md:block hidden">
                        <p>Add a Server</p>
                    </TooltipContent>
                </Tooltip>
                <SheetContent side="top" className="h-screen w-screen p-0 flex flex-col bg-background/95 backdrop-blur-sm border-none">
                    <SheetHeader className="pt-12 pb-6 shrink-0 px-4 md:px-8 text-center md:text-left">
                        <SheetTitle className="text-3xl">Add a Server</SheetTitle>
                        <SheetDescription className="text-base">
                            Create a new community or join an existing one.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Mobile view with Tabs */}
                    <div className="md:hidden flex-1 flex flex-col p-4">
                        <Tabs defaultValue="create" className="w-full h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 mx-auto max-w-sm">
                                <TabsTrigger value="create">Create</TabsTrigger>
                                <TabsTrigger value="join">Join</TabsTrigger>
                            </TabsList>
                            <TabsContent value="create" className="flex-1 flex flex-col justify-center items-center">
                                <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
                                    <CardHeader className="text-center px-0">
                                        <CardTitle className="text-2xl">Create Your Server</CardTitle>
                                        <CardDescription>Give your new community a name to get started.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-0">{createForm}</CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="join" className="flex-1 flex flex-col justify-center items-center">
                                <Card className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
                                    <CardHeader className="text-center px-0">
                                        <CardTitle className="text-2xl">Join a Server</CardTitle>
                                        <CardDescription>Enter an invite code to join an existing server.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-0">{joinForm}</CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Desktop view with 2 columns */}
                    <div className="hidden md:flex flex-1 items-center justify-center gap-8 px-8">
                        <Card className="w-full max-w-lg transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl bg-secondary/50">
                            <CardHeader className="text-center p-8">
                                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Create Your Server</CardTitle>
                                <CardDescription className="text-base">Give your new community a name to get started.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">{createForm}</CardContent>
                        </Card>

                        <Card className="w-full max-w-lg transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl bg-secondary/50">
                            <CardHeader className="text-center p-8">
                                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                                    <Compass className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Join a Server</CardTitle>
                                <CardDescription className="text-base">Enter an invite code to join an existing server.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">{joinForm}</CardContent>
                        </Card>
                    </div>
                </SheetContent>
            </Sheet>
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
