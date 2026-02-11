'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDoc, useFirestore, useServerMember, updateUserRole, useUserProfile, updateUserSettings, deleteUserDocument } from '@/firebase';
import type { UserProfile } from '@/firebase/auth/users';
import type { ServerMember, ServerRole } from '@/firebase/servers/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { doc, DocumentReference, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { add, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface UserProfilePopoverProps {
    children: React.ReactNode;
    userId: string;
    serverId?: string;
    currentUserMember?: ServerMember | null;
}

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Must be at least 2 characters.").max(50, "Must be 50 characters or less."),
  handle: z.string().min(2, "Must be at least 2 characters.").max(30, "Must be 30 characters or less.").regex(/^[a-zA-Z0-9_.]+$/, "Can only contain letters, numbers, underscores, and periods."),
});


export default function UserProfilePopover({ children, userId, serverId, currentUserMember }: UserProfilePopoverProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [isUpdatingGlobalStatus, setIsUpdatingGlobalStatus] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [isAdminEditDialogOpen, setIsAdminEditDialogOpen] = useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    
    const { data: currentUserProfile } = useUserProfile();

    const userProfileRef = useMemo(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
    }, [firestore, userId]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const { data: member, loading: memberLoading } = useServerMember(serverId, userId);
    
    const form = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        displayName: "",
        handle: "",
      },
    });
    
    useEffect(() => {
        if (userProfile && isAdminEditDialogOpen) {
            form.reset({
                displayName: userProfile.displayName || "",
                handle: userProfile.handle ? userProfile.handle.split('@')[0] : "",
            });
        }
    }, [userProfile, isAdminEditDialogOpen, form]);

    const isGlobalOwner = currentUserProfile?.status === 'owner';
    const isGlobalAdmin = isGlobalOwner || currentUserProfile?.status === 'admin';
    
    // Authorization checks
    const isSelf = currentUserProfile?.id === userId;
    
    const canModerateRoles = useMemo(() => {
        if (!currentUserMember || !member || isSelf) return false;
        if (currentUserMember.role === 'owner') return member.role !== 'owner';
        if (currentUserMember.role === 'admin') return member.role !== 'owner' && member.role !== 'admin';
        return false;
    }, [currentUserMember, member, isSelf]);

    const canChangeGlobalStatus = useMemo(() => {
        if (!isGlobalOwner || !userProfile || isSelf) return false;
        return userProfile.status !== 'owner';
    }, [isGlobalOwner, userProfile, isSelf]);

    const canModerateProfile = useMemo(() => {
        if (!isGlobalAdmin || !userProfile || isSelf) return false;
        if (isGlobalOwner) return userProfile.status !== 'owner';
        if (isGlobalAdmin) return userProfile.status === 'user';
        return false;
    }, [isGlobalAdmin, isGlobalOwner, userProfile, isSelf, currentUserProfile]);

    const fourWeeksInMillis = 4 * 7 * 24 * 60 * 60 * 1000;
    const canUpdateUsername = userProfile?.profileLastUpdatedAt ? (new Date().getTime() - userProfile.profileLastUpdatedAt.toDate().getTime()) > fourWeeksInMillis : true;
    const nextUpdateDate = userProfile?.profileLastUpdatedAt ? add(userProfile.profileLastUpdatedAt.toDate(), { weeks: 4 }) : null;

    const handleRoleChange = async (newRole: ServerRole) => {
        if (!firestore || !serverId || !canModerateRoles) return;
        setIsUpdatingRole(true);
        try {
            await updateUserRole(firestore, serverId, userId, newRole);
            toast({
                title: 'Role Updated',
                description: `${userProfile?.displayName}'s role has been changed to ${newRole}.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update user role.',
            });
        } finally {
            setIsUpdatingRole(false);
        }
    }

    const handleGlobalStatusChange = async (newStatus: 'admin' | 'user') => {
        if (!firestore || !canChangeGlobalStatus) return;
        setIsUpdatingGlobalStatus(true);
        try {
            await updateUserSettings(firestore, userId, { status: newStatus });
            toast({
                title: 'Global Status Updated',
                description: `${userProfile?.displayName}'s global status has been changed to ${newStatus}.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update global status.',
            });
        } finally {
            setIsUpdatingGlobalStatus(false);
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
      if (!firestore || !userProfile || !canModerateProfile) return;

      const updates: { [key: string]: any } = {};
      let hasIdentityChanged = false;

      if (values.displayName !== userProfile.displayName) {
          updates.displayName = values.displayName;
          hasIdentityChanged = true;
      }
      const newHandle = `${values.handle}@flux`;
      if (newHandle !== userProfile.handle) {
          updates.handle = newHandle;
          hasIdentityChanged = true;
      }
      
      if (Object.keys(updates).length === 0) {
          toast({ title: "No changes to save." });
          setIsAdminEditDialogOpen(false);
          return;
      }
      
      if (hasIdentityChanged && !canUpdateUsername) {
        toast({ variant: 'destructive', title: 'Cooldown Active', description: 'You cannot change this user\'s name or handle yet.' });
        return;
      }

      if (hasIdentityChanged) {
        updates.profileLastUpdatedAt = serverTimestamp();
      }

      setIsSaving(true);
      try {
        await updateUserSettings(firestore, userProfile.id!, updates);
        toast({ title: "Success!", description: "User profile has been updated." });
        setIsAdminEditDialogOpen(false);
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save profile.' });
        }
      } finally {
        setIsSaving(false);
      }
    }

    const handleDeleteUser = async () => {
        if (!firestore || !userProfile || !canModerateProfile) return;
        setIsDeleting(true);
        try {
            await deleteUserDocument(firestore, userProfile.id!);
            toast({ title: "User Deleted", description: `${userProfile.displayName}'s profile has been deleted.` });
            setIsDeleteUserDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user profile.' });
        } finally {
            setIsDeleting(false);
        }
    }

    const rolesThatCanBeAssigned: ServerRole[] = ['user', 'trial'];
    if (currentUserMember?.role === 'owner') {
        rolesThatCanBeAssigned.unshift('admin');
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                className="w-80 overflow-y-auto max-h-[85vh]"
                onPointerDownOutside={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('[data-radix-dialog-content]') || target.closest('[data-radix-select-content]')) {
                      e.preventDefault();
                  }
                }}
            >
                {profileLoading || (serverId && memberLoading) ? (
                    <div className="space-y-2">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ) : userProfile ? (
                    <div className="flex flex-col -m-4">
                         <div className="relative h-16 w-full bg-primary/20">
                            <Avatar className="absolute bottom-0 left-4 h-20 w-20 translate-y-1/2 border-4 border-background rounded-full">
                                {userProfile.photoURL && <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />}
                                <AvatarFallback>{userProfile.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="pt-12 p-4">
                            <h3 className="text-xl font-bold">{userProfile.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{userProfile.handle}</p>
                            
                            {serverId && member && (
                                <>
                                    <hr className="my-4"/>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Server Role</h4>
                                    {canModerateRoles ? (
                                        <div className="flex items-center gap-2">
                                             <Select defaultValue={member.role} onValueChange={(value) => handleRoleChange(value as ServerRole)} disabled={isUpdatingRole}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rolesThatCanBeAssigned.map(role => (
                                                        <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isUpdatingRole && <Loader2 className="h-4 w-4 animate-spin"/>}
                                        </div>
                                    ) : (
                                        <p className="font-semibold capitalize">{member.role}</p>
                                    )}
                                </>
                            )}

                            {canChangeGlobalStatus && (
                                <>
                                    <hr className="my-4"/>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Global Status</h4>
                                    <div className="flex items-center gap-2">
                                        <Select defaultValue={userProfile.status} onValueChange={(value) => handleGlobalStatusChange(value as 'admin' | 'user')} disabled={isUpdatingGlobalStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isUpdatingGlobalStatus && <Loader2 className="h-4 w-4 animate-spin"/>}
                                    </div>
                                </>
                            )}
                            
                            {canModerateProfile && (
                                <>
                                    <hr className="my-4"/>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Admin Controls</h4>
                                    <div className="flex gap-2">
                                        <Dialog open={isAdminEditDialogOpen} onOpenChange={setIsAdminEditDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">Edit Profile</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit {userProfile.displayName}'s Profile</DialogTitle>
                                                    <DialogDescription>
                                                        Changes will be saved immediately.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="displayName"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Display Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="User's display name" {...field} disabled={!canUpdateUsername || isSaving} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="handle"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Handle</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input placeholder="user_handle" {...field} className="pr-[5.5rem]" disabled={!canUpdateUsername || isSaving}/>
                                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">@flux</span>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {!canUpdateUsername && nextUpdateDate && (
                                                            <p className="text-sm text-muted-foreground">
                                                                You can change this user's display name and handle again {formatDistanceToNow(nextUpdateDate, { addSuffix: true })}.
                                                            </p>
                                                        )}
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button type="button" variant="secondary" disabled={isSaving}>Cancel</Button>
                                                            </DialogClose>
                                                            <Button type="submit" disabled={isSaving}>
                                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Save changes
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Delete User</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete {userProfile.displayName}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the user's profile data, but not their authentication account. They will be removed from all servers and friend lists. This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className={cn(
                                                        "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    )}>
                                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Delete User
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>User not found.</p>
                )}
            </PopoverContent>
        </Popover>
    );
}
