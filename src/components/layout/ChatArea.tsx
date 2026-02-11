'use client';

import { Hash, Pin, Users, Paperclip, Smile, Send, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Channel, ServerMember, ServerMessage } from '@/firebase/servers/types';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUserProfile, useFirestore, sendServerMessage, editServerMessage, deleteServerMessage, togglePinServerMessage, useServerMembers, kickServerMember, updateUserRole } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import MessageRenderer from '../MessageRenderer';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserProfilePopover from '../UserProfilePopover';


interface ChatAreaProps {
  serverId: string;
  activeChannel: Channel | undefined;
  messages: ServerMessage[] | null;
  messagesLoading: boolean;
  member: ServerMember | null;
}

const formSchema = z.object({
  text: z.string().min(1, "Message cannot be empty."),
});

const editFormSchema = z.object({
  text: z.string().min(1, "Message cannot be empty."),
});


export default function ChatArea({ serverId, activeChannel, messages, messagesLoading, member }: ChatAreaProps) {
    const { user } = useUser();
    const { data: userProfile } = useUserProfile();
    const firestore = useFirestore();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isPinnedSheetOpen, setIsPinnedSheetOpen] = useState(false);
    const [isMembersSheetOpen, setIsMembersSheetOpen] = useState(false);
    const [isUpdatingTrialMember, setIsUpdatingTrialMember] = useState<string | null>(null);

    const { data: serverMembers, loading: membersLoading } = useServerMembers(serverId);

    const pinnedMessages = messages?.filter(msg => msg.pinned) || [];

    const messageForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { text: "" },
    });
    
    const editForm = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
    });

    const isServerAdmin = member?.role === 'owner' || member?.role === 'admin';
    const isGlobalAdmin = userProfile?.status === 'owner' || userProfile?.status === 'admin';
    const canWrite = isServerAdmin || activeChannel?.userAccess === 'readwrite';

    const { trialMembers, adminMembers, regularMembers } = useMemo(() => {
        if (!serverMembers) return { trialMembers: [], adminMembers: [], regularMembers: [] };
        
        const trial = serverMembers.filter(m => m.role === 'trial');
        const admins = serverMembers.filter(m => m.role === 'owner' || m.role === 'admin');
        const regular = serverMembers.filter(m => m.role === 'user');

        return { 
            trialMembers: trial.sort((a,b) => a.userProfile.displayName.localeCompare(b.userProfile.displayName)),
            adminMembers: admins.sort((a,b) => a.userProfile.displayName.localeCompare(b.userProfile.displayName)),
            regularMembers: regular.sort((a,b) => a.userProfile.displayName.localeCompare(b.userProfile.displayName)),
         };
    }, [serverMembers]);


    async function onMessageSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user || !userProfile || !activeChannel) return;
        
        await sendServerMessage(firestore, serverId, activeChannel.id!, {
            text: values.text,
            authorId: user.uid,
            authorDisplayName: userProfile.displayName,
            authorPhotoURL: userProfile.photoURL || '',
        });

        messageForm.reset();
    }
    
    async function onEditSubmit(values: z.infer<typeof editFormSchema>) {
        if (!firestore || !activeChannel || !editingMessageId || !values.text) return;
        
        setIsSavingEdit(true);
        try {
            await editServerMessage(firestore, serverId, activeChannel.id, editingMessageId, values.text);
            setEditingMessageId(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save message.' });
        } finally {
            setIsSavingEdit(false);
        }
    }

    const handleConfirmDelete = async () => {
        if (!firestore || !activeChannel || !deletingMessageId) return;
        
        try {
            await deleteServerMessage(firestore, serverId, activeChannel.id, deletingMessageId);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete message.' });
        } finally {
            setDeletingMessageId(null);
            setIsDeleteAlertOpen(false);
        }
    }

    const handleTogglePin = async (message: ServerMessage) => {
        if (!firestore || !activeChannel || !message.id) return;

        try {
            await togglePinServerMessage(firestore, serverId, activeChannel.id, message.id, message.pinned);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update pin status.' });
        }
    }

    const handleAcceptTrialMember = async (memberId: string) => {
        if (!firestore) return;
        setIsUpdatingTrialMember(memberId);
        try {
            await updateUserRole(firestore, serverId, memberId, 'user');
            toast({ title: "Member Accepted", description: "This user now has full access." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not update member role." });
        } finally {
            setIsUpdatingTrialMember(null);
        }
    }

    const handleKickTrialMember = async (memberId: string) => {
        if (!firestore) return;
        setIsUpdatingTrialMember(memberId);
         try {
            await kickServerMember(firestore, serverId, memberId);
            toast({ title: "Member Kicked", description: "This user has been removed from the server." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not kick member." });
        } finally {
            setIsUpdatingTrialMember(null);
        }
    }
    
    const startEditing = (message: ServerMessage) => {
        setEditingMessageId(message.id!);
        editForm.setValue('text', message.text);
    }
    
    const cancelEditing = () => {
        setEditingMessageId(null);
        editForm.reset();
    }
    
    const startDeleting = (message: ServerMessage) => {
        setDeletingMessageId(message.id!);
        setIsDeleteAlertOpen(true);
    }

    useEffect(() => {
        if (scrollAreaRef.current && messages?.length) {
            const lastMessage = messages[messages.length - 1];
            // Only auto-scroll if the new message is from the current user, or if we are already near the bottom
            const viewport = scrollAreaRef.current.querySelector('div');
            if (viewport) {
                const isScrolledToBottom = viewport.scrollHeight - viewport.clientHeight <= viewport.scrollTop + 100;
                if (lastMessage?.authorId === user?.uid || isScrolledToBottom) {
                    setTimeout(() => {
                        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                    }, 100);
                }
            }
        }
    }, [messages, user?.uid]);

    if (!activeChannel) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p>Select a channel to start chatting.</p>
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="hidden h-12 shrink-0 items-center border-b border-border/50 px-4 md:flex">
        <div className="flex items-center">
          <Hash className="h-6 w-6 text-muted-foreground" />
          <h2 className="ml-2 text-lg font-semibold">{activeChannel.name}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Sheet open={isPinnedSheetOpen} onOpenChange={setIsPinnedSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon"><Pin className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Pinned Messages in #{activeChannel.name}</SheetTitle>
                        <SheetDescription>
                            {pinnedMessages.length > 0 
                                ? `There are ${pinnedMessages.length} pinned messages in this channel.`
                                : "There are no pinned messages in this channel."
                            }
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 -mx-6">
                        <div className="px-6 py-4 space-y-4">
                            {pinnedMessages.length > 0 ? (
                                pinnedMessages.map(msg => (
                                    <div key={msg.id} className="p-3 rounded-lg border bg-card/50">
                                        <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                <AvatarImage src={msg.authorPhotoURL} alt={msg.authorDisplayName} />
                                                <AvatarFallback>{msg.authorDisplayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                    <div className="flex items-baseline gap-2">
                                                    <p className="font-semibold text-primary">{msg.authorDisplayName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {msg.createdAt ? format(msg.createdAt.toDate(), 'PP p') : null}
                                                    </p>
                                                </div>
                                                <MessageRenderer content={msg.text} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                                    <Pin className="h-12 w-12 mb-4" />
                                    <h3 className="text-lg font-semibold">No Pinned Messages</h3>
                                    <p className="text-sm">There are no pinned messages in this channel yet.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            <Sheet open={isMembersSheetOpen} onOpenChange={setIsMembersSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon"><Users className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent 
                    className="flex flex-col"
                    onPointerDownOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-popover-content]') || target.closest('[data-radix-select-content]')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <SheetHeader>
                        <SheetTitle>Server Members</SheetTitle>
                        <SheetDescription>
                            {serverMembers?.length || 0} members
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 -mx-6">
                        <div className="px-6 py-4 space-y-6">
                            {membersLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {isServerAdmin && trialMembers.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-amber-500 mb-2">Trial Members — {trialMembers.length}</h3>
                                            <div className="space-y-2">
                                                {trialMembers.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group/member-item">
                                                        <UserProfilePopover userId={m.id!} serverId={serverId} currentUserMember={member}>
                                                             <div className="flex items-center gap-3 rounded-md cursor-pointer flex-1 -m-2 p-2">
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarImage src={m.userProfile.photoURL} alt={m.userProfile.displayName} />
                                                                    <AvatarFallback>{m.userProfile.displayName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <p className="font-semibold">{m.userProfile.displayName}</p>
                                                            </div>
                                                        </UserProfilePopover>
                                                        {isUpdatingTrialMember === m.id ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => handleKickTrialMember(m.id!)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400" onClick={() => handleAcceptTrialMember(m.id!)}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {adminMembers.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Admins — {adminMembers.length}</h3>
                                            <div className="space-y-2">
                                                {adminMembers.map(m => (
                                                     <div key={m.id} className="flex items-center gap-3 p-2 -m-2 rounded-md hover:bg-accent group/member-item">
                                                         <UserProfilePopover userId={m.id!} serverId={serverId} currentUserMember={member}>
                                                            <div className="flex items-center gap-3 rounded-md cursor-pointer flex-1">
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarImage src={m.userProfile.photoURL} alt={m.userProfile.displayName} />
                                                                    <AvatarFallback>{m.userProfile.displayName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <p className="font-semibold">{m.userProfile.displayName}</p>
                                                            </div>
                                                        </UserProfilePopover>
                                                     </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {regularMembers.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Members — {regularMembers.length}</h3>
                                            <div className="space-y-2">
                                                {regularMembers.map(m => (
                                                    <div key={m.id} className="flex items-center gap-3 p-2 -m-2 rounded-md hover:bg-accent group/member-item">
                                                        <UserProfilePopover userId={m.id!} serverId={serverId} currentUserMember={member}>
                                                            <div className="flex items-center gap-3 rounded-md cursor-pointer flex-1">
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarImage src={m.userProfile.photoURL} alt={m.userProfile.displayName} />
                                                                    <AvatarFallback>{m.userProfile.displayName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <p className="font-semibold">{m.userProfile.displayName}</p>
                                                            </div>
                                                        </UserProfilePopover>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4">
            {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : messages && messages.length > 0 ? messages.map((msg, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAuthor = !prevMessage || prevMessage.authorId !== msg.authorId;
              
              const isAuthor = msg.authorId === user?.uid;
              const canEdit = isAuthor;
              const canDelete = isAuthor || isServerAdmin || isGlobalAdmin;
              const canPin = isServerAdmin || isGlobalAdmin;

              return (
                 <div key={msg.id} className={cn("group relative flex items-start gap-3 py-1", showAuthor && 'mt-3')}>
                    {/* Message Toolbar */}
                     {(canEdit || canDelete || canPin) && (
                        <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card border rounded-md shadow-sm z-10">
                            {canEdit && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(msg)}><Pencil className="h-4 w-4"/></Button>}
                            {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => startDeleting(msg)}><Trash2 className="h-4 w-4"/></Button>}
                            {canPin && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePin(msg)}><Pin className={cn("h-4 w-4", msg.pinned && 'fill-current')}/></Button>}
                        </div>
                    )}
                    <div className="w-10">
                        {showAuthor && (
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={msg.authorPhotoURL} alt={msg.authorDisplayName} />
                                <AvatarFallback>{msg.authorDisplayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    <div className='flex-1'>
                        {showAuthor && (
                            <div className="flex items-baseline gap-2">
                                <UserProfilePopover userId={msg.authorId} serverId={serverId} currentUserMember={member}>
                                    <p className="font-semibold text-primary cursor-pointer hover:underline">{msg.authorDisplayName}</p>
                                </UserProfilePopover>
                                <p className="text-xs text-muted-foreground">
                                    {msg.createdAt ? format(msg.createdAt.toDate(), 'PP p') : null}
                                </p>
                            </div>
                        )}

                        {editingMessageId === msg.id ? (
                            <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                                    <FormField
                                        control={editForm.control}
                                        name="text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-0 h-auto" disabled={isSavingEdit}/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="text-xs mt-2">
                                        escape to <Button type="button" variant="link" className="p-0 h-auto" onClick={cancelEditing}>cancel</Button>
                                         - enter to <Button type="submit" variant="link" className="p-0 h-auto" disabled={isSavingEdit}>save</Button>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                           <div className="flex items-center gap-2">
                                {msg.pinned && <Pin className="h-3 w-3 text-primary" />}
                                <MessageRenderer content={msg.text} />
                                {msg.editedAt && <span className="text-xs text-muted-foreground select-none">(edited)</span>}
                           </div>
                        )}
                    </div>
                </div>
              );
            }) : (
              <div className="flex items-start gap-4 pt-8 pl-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Hash className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">Welcome to #{activeChannel.name}!</h3>
                    <p className="text-muted-foreground">This is the beginning of the #{activeChannel.name} channel.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="shrink-0 border-t border-border/50 p-4">
        <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="relative">
                 <FormField
                    control={messageForm.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                 <Input
                                    placeholder={canWrite ? `Message #${activeChannel.name}` : "You don't have permission to post here."}
                                    className="h-11 bg-secondary/80 pr-24 text-base"
                                    autoComplete="off"
                                    disabled={!canWrite}
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled={!canWrite}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled={!canWrite}>
                        <Smile className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" type="submit" disabled={messageForm.formState.isSubmitting || !canWrite}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </Form>
      </footer>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                  <AlertDialogDescription>
                      Are you sure you want to delete this message? This cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    




