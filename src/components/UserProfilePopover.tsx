'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDoc, useFirestore, useServerMember, updateUserRole } from '@/firebase';
import type { UserProfile } from '@/firebase/auth/users';
import type { ServerMember, ServerRole } from '@/firebase/servers/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { doc, DocumentReference } from 'firebase/firestore';

interface UserProfilePopoverProps {
    children: React.ReactNode;
    userId: string;
    serverId?: string;
    currentUserMember?: ServerMember | null;
}

export default function UserProfilePopover({ children, userId, serverId, currentUserMember }: UserProfilePopoverProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    const userProfileRef = useMemo(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
    }, [firestore, userId]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const { data: member, loading: memberLoading } = useServerMember(serverId, userId);

    const canManageRoles = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';
    const isSelf = currentUserMember?.id === userId;

    // Admins can't change owner's role or other admins' roles. Owners can change anyone but themselves.
    const canChangeThisUserRole = canManageRoles && !isSelf && 
        (currentUserMember?.role === 'owner' ? member?.role !== 'owner' : (member?.role !== 'owner' && member?.role !== 'admin'));

    const handleRoleChange = async (newRole: ServerRole) => {
        if (!firestore || !serverId || !canChangeThisUserRole) return;
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

    const rolesThatCanBeAssigned: ServerRole[] = ['user', 'trial'];
    if (currentUserMember?.role === 'owner') {
        rolesThatCanBeAssigned.unshift('admin');
    }

    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                {profileLoading || (serverId && memberLoading) ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ) : userProfile ? (
                    <div className="flex flex-col">
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
                                    {canChangeThisUserRole ? (
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
                        </div>
                    </div>
                ) : (
                    <p className="p-4">User not found.</p>
                )}
            </PopoverContent>
        </Popover>
    );
}
