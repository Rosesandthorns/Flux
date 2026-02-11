'use client';

import { Paperclip, Smile, AtSign, Phone, Send, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useUserProfile, useFirestore, useMessages, sendMessage, editMessage, deleteMessage, useAuthorProfiles } from '@/firebase';
import { getConversationId, cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import type { FriendWithProfile } from '@/firebase/friends/types';
import MessageRenderer from '../MessageRenderer';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import UserProfilePopover from '../UserProfilePopover';
import { useDMCall } from '@/context/DMCallContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import EmojiPicker from '../EmojiPicker';
import Image from 'next/image';

interface DMChatAreaProps {
    contact: FriendWithProfile;
}

const messageFormSchema = z.object({
  text: z.string().max(2000),
});

const editFormSchema = z.object({
  text: z.string().min(1, "Message cannot be empty.").max(2000),
});

export default function DMChatArea({ contact }: DMChatAreaProps) {
    const { user } = useUser();
    const { data: userProfile } = useUserProfile();
    const firestore = useFirestore();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { startCall } = useDMCall();

    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [attachmentUrls, setAttachmentUrls] = useState("");
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);


    const conversationId = user ? getConversationId(user.uid, contact.id) : null;
    const { messages, loading: messagesLoading } = useMessages(conversationId);
    
    const authorIds = useMemo(() => (messages ? [...new Set(messages.map((m) => m.authorId).concat(user?.uid || '', contact.id))] : [user?.uid || '', contact.id]), [messages, contact.id, user?.uid]);
    const { profiles: authorProfiles, loading: profilesLoading } = useAuthorProfiles(authorIds);

    const messageForm = useForm<z.infer<typeof messageFormSchema>>({
        resolver: zodResolver(messageFormSchema),
        defaultValues: { text: "" },
    });
    
    const editForm = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
    });

    const handleCall = () => {
        startCall(contact.id);
    }

    async function onMessageSubmit(values: z.infer<typeof messageFormSchema>) {
        if (!firestore || !conversationId || !user || !userProfile) return;
        
        let messageText = values.text;
        if (attachments.length > 0) {
            const attachmentMarkdown = attachments.map(url => `\n![image](${url})`).join('');
            messageText += attachmentMarkdown;
        }

        if (!messageText.trim()) return;

        await sendMessage(firestore, conversationId, {
            text: messageText,
            authorId: user.uid,
        });

        messageForm.reset();
        setAttachments([]);
    }
    
    async function onEditSubmit(values: z.infer<typeof editFormSchema>) {
        if (!firestore || !conversationId || !editingMessageId || !values.text) return;
        
        setIsSavingEdit(true);
        try {
            await editMessage(firestore, conversationId, editingMessageId, values.text);
            setEditingMessageId(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save message.' });
        } finally {
            setIsSavingEdit(false);
        }
    }

    const handleConfirmDelete = async () => {
        if (!firestore || !conversationId || !deletingMessageId) return;
        
        try {
            await deleteMessage(firestore, conversationId, deletingMessageId);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete message.' });
        } finally {
            setDeletingMessageId(null);
            setIsDeleteAlertOpen(false);
        }
    }
    
    const startEditing = (message: any) => {
        setEditingMessageId(message.id!);
        editForm.setValue('text', message.text);
    }
    
    const cancelEditing = () => {
        setEditingMessageId(null);
        editForm.reset();
    }
    
    const startDeleting = (message: any) => {
        setDeletingMessageId(message.id!);
        setIsDeleteAlertOpen(true);
    }

    const handleEmojiSelect = (emoji: string) => {
        const textarea = inputRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = messageForm.getValues("text");
            const newText = text.substring(0, start) + emoji + text.substring(end);
            messageForm.setValue("text", newText, { shouldValidate: true });
            
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 0);
        }
    };

    const handleAddAttachments = () => {
        const urls = attachmentUrls.split('\n').map(url => url.trim()).filter(url => url.startsWith('http'));
        const newAttachments = [...attachments, ...urls].slice(0, 20);
        setAttachments(newAttachments);
        setAttachmentUrls("");
        setIsAttachmentDialogOpen(false);
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }
    
    useEffect(() => {
        if (scrollAreaRef.current && messages?.length) {
            const lastMessage = messages[messages.length - 1];
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

    const isGlobalAdmin = userProfile?.status === 'owner' || userProfile?.status === 'admin';
    const contactProfile = authorProfiles[contact.id];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="hidden h-12 shrink-0 items-center border-b border-border/50 px-4 md:flex">
        <UserProfilePopover userId={contact.id}>
            <div className="flex items-center cursor-pointer rounded-md -ml-2 p-2 hover:bg-accent">
                <AtSign className="h-6 w-6 text-muted-foreground" />
                <h2 className="ml-2 text-lg font-semibold">{contactProfile?.displayName || contact.userProfile.displayName}</h2>
            </div>
        </UserProfilePopover>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCall}>
                <Phone className="h-5 w-5" />
            </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4">
             {messagesLoading || profilesLoading ? (
                 <div className="flex items-center justify-center h-full">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
             ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showAuthor = !prevMessage || prevMessage.authorId !== msg.authorId;
                    const isAuthor = msg.authorId === user?.uid;

                    const canEdit = isAuthor;
                    const canDelete = isAuthor || isGlobalAdmin;

                    const author = authorProfiles[msg.authorId];
                    if (!author) return <div key={msg.id || index} className="h-12" />;
                    
                    return (
                        <div key={msg.id} className={cn("group relative flex items-start gap-3 py-1", showAuthor && 'mt-3')}>
                            {/* Message Toolbar */}
                            {(canEdit || canDelete) && (
                                <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card border rounded-md shadow-sm z-10">
                                    {canEdit && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(msg)}><Pencil className="h-4 w-4"/></Button>}
                                    {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => startDeleting(msg)}><Trash2 className="h-4 w-4"/></Button>}
                                </div>
                            )}
                            <div className="w-10">
                                {showAuthor && (
                                    <UserProfilePopover userId={msg.authorId}>
                                        <Avatar className="h-10 w-10 cursor-pointer">
                                            <AvatarImage src={author.photoURL} alt={author.displayName} />
                                            <AvatarFallback>{author.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </UserProfilePopover>
                                )}
                            </div>
                            <div className="flex-1">
                                {showAuthor && (
                                    <div className="flex items-baseline gap-2">
                                        <UserProfilePopover userId={msg.authorId}>
                                            <p className="font-semibold text-primary cursor-pointer hover:underline">{author.displayName}</p>
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
                                        <MessageRenderer content={msg.text} />
                                        {msg.editedAt && <span className="text-xs text-muted-foreground select-none">(edited)</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })
             ) : (
                contactProfile && (
                    <UserProfilePopover userId={contact.id}>
                        <div className="flex items-start gap-4 pt-8 pl-4 cursor-pointer">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={contactProfile.photoURL} alt={contactProfile.displayName} />
                                <AvatarFallback>{contactProfile.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-2xl font-bold hover:underline">{contactProfile.displayName}</h3>
                                <p className="text-muted-foreground">This is the beginning of your direct message history with <span className="font-semibold text-foreground">@{contactProfile.handle.split('@')[0]}</span>.</p>
                            </div>
                        </div>
                    </UserProfilePopover>
                )
             )}
          </div>
        </ScrollArea>
      </div>

      <footer className="shrink-0 border-t border-border/50 p-2 sm:p-4">
        <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="flex flex-col">
                {attachments.length > 0 && (
                    <div className="p-2 border-b">
                        <p className="text-xs text-muted-foreground mb-2">Attachments ({attachments.length}/20)</p>
                        <div className="flex gap-2 flex-wrap">
                            {attachments.map((url, index) => (
                                <div key={index} className="relative h-16 w-16 rounded-md overflow-hidden">
                                    <Image src={url} alt={`Attachment ${index + 1}`} fill className="object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/50"
                                        onClick={() => removeAttachment(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="relative">
                    <FormField
                        control={messageForm.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                     <Textarea
                                        ref={inputRef}
                                        placeholder={`Message @${contactProfile?.displayName || contact.userProfile.displayName}`}
                                        className="h-auto max-h-48 bg-secondary/80 pr-32 text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        autoComplete="off"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (messageForm.getValues("text").trim() || attachments.length > 0) {
                                                    messageForm.handleSubmit(onMessageSubmit)();
                                                }
                                            }
                                        }}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Attach Images</DialogTitle>
                                    <DialogDescription>Paste up to 20 image URLs, one per line. They will be appended to your message.</DialogDescription>
                                </DialogHeader>
                                <Textarea 
                                    placeholder="https://example.com/image1.png&#10;https://example.com/image2.jpg"
                                    className="h-48"
                                    value={attachmentUrls}
                                    onChange={(e) => setAttachmentUrls(e.target.value)}
                                />
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                    <Button type="button" onClick={handleAddAttachments}>Add Images</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                         <Button variant="ghost" size="icon" className="h-8 w-8" type="submit" disabled={messageForm.formState.isSubmitting || (!messageForm.getValues("text") && attachments.length === 0)}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
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
