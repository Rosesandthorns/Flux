"use client";

import { Search, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Use chat avatars as placeholder for DM contacts
const dmContacts = PlaceHolderImages.filter(img => img.id.startsWith('chat-avatar-')).map((img, index) => ({
    id: img.id,
    name: ['Alice', 'Bob', 'Charlie'][index],
    avatarUrl: img.imageUrl,
    avatarHint: img.imageHint,
    status: index % 2 === 0 ? 'Online' : 'Offline',
}));


export default function DirectMessages() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar with conversations */}
      <div className="w-80 flex-shrink-0 border-r border-border/50 bg-secondary/30 flex flex-col">
        <div className="p-4 pb-0">
            <div className="flex h-12 items-center justify-between">
                <h1 className="text-xl font-bold">Direct Messages</h1>
                <Button variant="ghost" size="icon">
                    <UserPlus className="h-5 w-5" />
                </Button>
            </div>
            <div className="relative my-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Find or start a conversation" className="pl-9 bg-background" />
            </div>
        </div>
        <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 p-2">
                {dmContacts.map(contact => (
                    <button key={contact.id} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent">
                        <Avatar className="h-10 w-10 relative">
                            <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint={contact.avatarHint} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            {contact.status === 'Online' && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                        </Avatar>
                        <div>
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.status}</p>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
      </div>

      {/* Main chat view */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-background">
        <div className="text-center">
            <div className="text-5xl text-muted-foreground mb-4">📨</div>
          <h2 className="text-2xl font-semibold text-muted-foreground">Your Messages</h2>
          <p className="mt-2 text-muted-foreground">Select a conversation to start chatting.</p>
        </div>
      </div>
    </div>
  );
}
