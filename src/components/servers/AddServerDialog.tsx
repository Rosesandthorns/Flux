'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createServer, joinServer, useFirestore, useUser } from '@/firebase';
import { Loader2, Users, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddServerDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [serverName, setServerName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();

    const handleCreateServer = async () => {
        if (!firestore || !user || !serverName) return;

        setIsCreating(true);
        try {
            const newServerId = await createServer(firestore, user, serverName);
            toast({
                title: 'Server Created!',
                description: `Welcome to ${serverName}.`,
            });
            setOpen(false);
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
                setOpen(false);
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
    
    // Extracted form components to avoid repetition
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


    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
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
    );
}
