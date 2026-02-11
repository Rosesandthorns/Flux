'use client';

import { Paperclip, Smile, AtSign, Phone, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useUserProfile, useFirestore, useMessages, sendMessage } from '@/firebase';
import { getConversationId } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import type { FriendWithProfile } from '@/firebase/friends/types';
import MessageRenderer from '../MessageRenderer';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import { Skeleton } from '../ui/skeleton';

interface DMChatAreaProps {
    contact: FriendWithProfile;
}

const formSchema = z.object({
  text: z.string().min(1, "Message cannot be empty."),
});

export default function DMChatArea({ contact }: DMChatAreaProps) {
    const { user } = useUser();
    const { data: userProfile } = useUserProfile();
    const firestore = useFirestore();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const conversationId = user ? getConversationId(user.uid, contact.id) : null;
    const { messages, loading: messagesLoading } = useMessages(conversationId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !conversationId || !user || !userProfile) return;
        
        await sendMessage(firestore, conversationId, {
            text: values.text,
            authorId: user.uid,
            authorDisplayName: userProfile.displayName,
            authorPhotoURL: userProfile.photoURL || '',
        });

        form.reset();
    }
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="hidden h-12 shrink-0 items-center border-b border-border/50 px-4 md:flex">
        <div className="flex items-center">
          <AtSign className="h-6 w-6 text-muted-foreground" />
          <h2 className="ml-2 text-lg font-semibold">{contact.userProfile.displayName}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
            </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4">
             {messagesLoading ? (
                 <div className="flex items-center justify-center h-full">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
             ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showAuthor = !prevMessage || prevMessage.authorId !== msg.authorId;
                    
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${showAuthor ? 'mt-4' : 'mt-0.5'}`}>
                            <div className="w-10">
                                {showAuthor && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={msg.authorPhotoURL} alt={msg.authorDisplayName} />
                                        <AvatarFallback>{msg.authorDisplayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                            <div>
                                {showAuthor && (
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-semibold text-primary">{msg.authorDisplayName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {msg.createdAt ? format(msg.createdAt.toDate(), 'PP p') : null}
                                        </p>
                                    </div>
                                )}
                                <MessageRenderer content={msg.text} />
                            </div>
                        </div>
                    )
                })
             ) : (
                <div className="flex items-start gap-4 pt-8 pl-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={contact.userProfile.photoURL} alt={contact.userProfile.displayName} />
                        <AvatarFallback>{contact.userProfile.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-2xl font-bold">{contact.userProfile.displayName}</h3>
                        <p className="text-muted-foreground">This is the beginning of your direct message history with <span className="font-semibold text-foreground">@{contact.userProfile.handle.split('@')[0]}</span>.</p>
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
      </div>

      <footer className="shrink-0 border-t border-border/50 p-2 md:p-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                 <Input
                                    placeholder={`Message @${contact.userProfile.displayName}`}
                                    className="h-11 bg-secondary/80 pr-24 text-base"
                                    autoComplete="off"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                        <Smile className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" type="submit" disabled={form.formState.isSubmitting}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </Form>
      </footer>
    </div>
  );
}
