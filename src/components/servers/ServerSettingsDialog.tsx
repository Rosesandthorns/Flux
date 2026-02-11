
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useServer, useServerMembers, useUser, updateServer, transferServerOwnership, deleteServer, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Server } from '@/firebase/servers/types';

interface ServerSettingsDialogProps {
  serverId: string;
  children: React.ReactNode;
}

export default function ServerSettingsDialog({ serverId, children }: ServerSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { data: server, loading: serverLoading } = useServer(serverId);
  const { data: members, loading: membersLoading } = useServerMembers(serverId);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [serverName, setServerName] = useState('');
  const [trialMode, setTrialMode] = useState(false);
  const [acceptingInvites, setAcceptingInvites] = useState(true);

  // Operation state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Dialog state
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showTransferAlert, setShowTransferAlert] = useState(false);

  // Transfer ownership state
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (server) {
      setServerName(server.name);
      setTrialMode(server.trialModeEnabled ?? false);
      setAcceptingInvites(server.acceptingInvites ?? true);
    }
  }, [server]);

  const potentialNewOwners = useMemo(() => {
    return members.filter(m => m.id !== user?.uid);
  }, [members, user]);

  const selectedNewOwner = useMemo(() => {
    return members.find(m => m.id === newOwnerId);
  }, [members, newOwnerId]);

  const handleUpdateSettings = async () => {
    if (!firestore || !server) return;
    setIsSaving(true);
    
    const updates: Partial<Server> = {};
    if (serverName !== server.name) updates.name = serverName;
    if (trialMode !== server.trialModeEnabled) updates.trialModeEnabled = trialMode;
    if (acceptingInvites !== server.acceptingInvites) updates.acceptingInvites = acceptingInvites;

    if (Object.keys(updates).length > 0) {
        try {
            await updateServer(firestore, serverId, updates);
            toast({ title: "Settings saved!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error saving settings", description: error.message });
        }
    }
    setIsSaving(false);
  };

  const handleInitiateTransfer = () => {
    if (!newOwnerId || !selectedNewOwner) {
        toast({ variant: 'destructive', title: "Please select a new owner." });
        return;
    }
    setShowTransferAlert(true);
  }

  const handleConfirmTransfer = async () => {
    if (!firestore || !user || !newOwnerId) return;
    setIsTransferring(true);
    try {
        await transferServerOwnership(firestore, serverId, user.uid, newOwnerId);
        toast({ title: "Ownership Transferred!", description: `The server is now owned by ${selectedNewOwner?.userProfile.displayName}.`});
        setShowTransferAlert(false);
        setOpen(false); // Close main dialog on success
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error transferring ownership", description: error.message });
    } finally {
        setIsTransferring(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
        await deleteServer(firestore, serverId);
        toast({ title: "Server Deleted", description: "The server has been permanently deleted." });
        router.push('/');
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error deleting server", description: error.message });
    } finally {
        setIsDeleting(false);
        setShowDeleteAlert(false);
        setOpen(false);
    }
  };

  if (!server) {
      return children; // Should not happen if canManageServer is true, but for safety
  }

  const isOwner = server.ownerId === user?.uid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
            <DialogTitle>Settings for {server.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex overflow-hidden">
          <Tabs defaultValue="general" className="w-full flex">
            <TabsList className="flex flex-col h-full justify-start p-4 border-r gap-1 bg-transparent w-64">
              <TabsTrigger value="general" className="w-full justify-start">General</TabsTrigger>
              {isOwner && <TabsTrigger value="members" className="w-full justify-start">Members</TabsTrigger>}
              {isOwner && <TabsTrigger value="danger" className="w-full justify-start text-destructive data-[state=active]:border-destructive">Danger Zone</TabsTrigger>}
            </TabsList>
            <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="general">
                    <Card className="border-none shadow-none">
                        <CardHeader className="px-1">
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Manage your server's basic information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="server-name-settings">Server Name</Label>
                                <Input id="server-name-settings" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label>Accepting Invites</Label>
                                    <p className="text-xs text-muted-foreground">Allow new users to join via the invite code.</p>
                                </div>
                                <Switch checked={acceptingInvites} onCheckedChange={setAcceptingInvites} />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label>Trial Mode</Label>
                                    <p className="text-xs text-muted-foreground">New members will join with a restricted 'trial' role.</p>
                                </div>
                                <Switch checked={trialMode} onCheckedChange={setTrialMode} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {isOwner && (
                    <TabsContent value="members">
                        <Card className="border-none shadow-none">
                            <CardHeader className="px-1">
                                <CardTitle>Members</CardTitle>
                                <CardDescription>Manage server ownership.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-1">
                                <Card className="border-amber-500/50 bg-amber-500/5">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Transfer Ownership</CardTitle>
                                        <CardDescription>Transfer ownership of this server to another member. This action is irreversible.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center gap-4">
                                        <Select onValueChange={setNewOwnerId} disabled={membersLoading}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a new owner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {potentialNewOwners.map(m => (
                                                    <SelectItem key={m.id} value={m.id!}>{m.userProfile.displayName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" onClick={handleInitiateTransfer} disabled={!newOwnerId}>
                                            Transfer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
                 {isOwner && (
                    <TabsContent value="danger">
                         <Card className="border-none shadow-none">
                            <CardHeader className="px-1">
                                <CardTitle>Danger Zone</CardTitle>
                                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-1">
                                <Card className="border-destructive/50 bg-destructive/5">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-destructive">Delete this server</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm mb-4">
                                            Once you delete a server, there is no going back. Please be certain.
                                        </p>
                                        <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>Delete Server</Button>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>
                 )}
            </div>
          </Tabs>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>

        {/* Transfer Ownership Alert */}
        <AlertDialog open={showTransferAlert} onOpenChange={setShowTransferAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Transfer ownership to {selectedNewOwner?.userProfile.displayName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will lose all ownership permissions and become an admin. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isTransferring}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmTransfer} disabled={isTransferring} className={cn(buttonVariants({ variant: "destructive" }))}>
                         {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        I understand, transfer ownership
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Delete Server Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the <span className="font-bold">{server.name}</span> server. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }))}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete this server
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Dialog>
  );
}
