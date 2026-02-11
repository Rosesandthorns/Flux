'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createServer, joinServer, useFirestore, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Tabs defaultValue="create" className="w-full">
                    <DialogHeader className="items-center">
                        <DialogTitle>Add a Server</DialogTitle>
                        <DialogDescription>
                            Create a new space or join an existing one.
                        </DialogDescription>
                         <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="create">Create</TabsTrigger>
                            <TabsTrigger value="join">Join</TabsTrigger>
                        </TabsList>
                    </DialogHeader>

                    <TabsContent value="create" className="p-1">
                        <div className="space-y-4 py-2 pb-4">
                            <div className="space-y-2">
                                <Label htmlFor="server-name">Server Name</Label>
                                <Input
                                    id="server-name"
                                    placeholder="Your Awesome Server"
                                    value={serverName}
                                    onChange={(e) => setServerName(e.target.value)}
                                />
                            </div>
                        </div>
                         <Button onClick={handleCreateServer} disabled={isCreating || !serverName} className="w-full">
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Server
                        </Button>
                    </TabsContent>
                    <TabsContent value="join" className="p-1">
                         <div className="space-y-4 py-2 pb-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-code">Invite Code</Label>
                                <Input
                                    id="invite-code"
                                    placeholder="Enter an invite code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                />
                            </div>
                        </div>
                         <Button onClick={handleJoinServer} disabled={isJoining || !inviteCode} className="w-full">
                            {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join Server
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
