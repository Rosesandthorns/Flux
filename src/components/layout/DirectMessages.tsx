"use client";

import { Search, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Use chat avatars as placeholder for DM contacts
const dmContacts = PlaceHolderImages.filter(img => img.id.startsWith('chat-avatar-')).map((img, index) => ({
    id: img.id,
    name: ['Alice', 'Bob', 'Charlie'][index],
    avatarUrl: img.imageUrl,
    avatarHint: img.imageHint,
    status: index % 2 === 0 ? 'Online' : 'Offline',
}));

// Mock data for pending requests
const pendingRequests = [
    { id: 'pending-1', name: 'David', avatarUrl: PlaceHolderImages.find(i => i.id === 'chat-avatar-1')?.imageUrl, avatarHint: 'person' },
    { id: 'pending-2', name: 'Eve', avatarUrl: PlaceHolderImages.find(i => i.id === 'chat-avatar-2')?.imageUrl, avatarHint: 'person' },
];


export default function DirectMessages() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar with conversations and friend management */}
      <div className="w-full flex-shrink-0 border-r border-border/50 bg-secondary/30 flex flex-col md:w-80">
        <div className="p-4 pb-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Find or start a conversation" className="pl-9 bg-background" />
            </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden px-4">
            <TabsList className="grid w-full grid-cols-5 bg-transparent p-0 h-auto gap-1">
                <TabsTrigger value="online" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground">Online</TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground">All</TabsTrigger>
                <TabsTrigger value="pending" className="relative data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground">
                    Pending
                    {pendingRequests.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">{pendingRequests.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="blocked" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground">Blocked</TabsTrigger>
                <TabsTrigger value="add" className="text-green-500 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md font-semibold">Add Friend</TabsTrigger>
            </TabsList>
            <Separator className="my-3 bg-border/50" />

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <TabsContent value="online">
                    <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">Online — {dmContacts.filter(c => c.status === 'Online').length}</h2>
                    {dmContacts.filter(c => c.status === 'Online').map(contact => (
                         <button key={contact.id} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent">
                            <Avatar className="h-10 w-10 relative">
                                <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint={contact.avatarHint as string} />
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            </Avatar>
                            <div>
                                <p className="font-semibold">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.status}</p>
                            </div>
                        </button>
                    ))}
                </TabsContent>
                <TabsContent value="all">
                     <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">All Friends — {dmContacts.length}</h2>
                    {dmContacts.map(contact => (
                        <button key={contact.id} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent">
                            <Avatar className="h-10 w-10 relative">
                                <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint={contact.avatarHint as string} />
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
                </TabsContent>
                <TabsContent value="pending">
                    <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">Pending — {pendingRequests.length}</h2>
                     <div className="space-y-1">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex w-full items-center rounded-md p-2 hover:bg-accent/80 justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        {req.avatarUrl && <AvatarImage src={req.avatarUrl} alt={req.name} data-ai-hint={req.avatarHint as string} />}
                                        <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{req.name}</p>
                                        <p className="text-xs text-muted-foreground">Incoming Friend Request</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-400">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive/80">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="blocked">
                     <div className="text-center text-muted-foreground p-8">
                        You don't have any blocked users.
                    </div>
                </TabsContent>
                <TabsContent value="add">
                    <div className="p-2">
                        <h2 className="text-lg font-bold uppercase">Add Friend</h2>
                        <p className="text-muted-foreground text-sm mt-1 mb-4">You can add a friend with their FluxTag. It's cAsE-sEnSiTiVe!</p>
                        <div className="relative rounded-md bg-background/50">
                            <Input placeholder="Enter a Username#0000" className="bg-transparent border-0 pr-48" />
                            <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 bg-primary hover:bg-primary/90">Send Friend Request</Button>
                        </div>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
      </div>

      {/* Main chat view */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 bg-background">
        <div className="text-center">
            <div className="text-5xl text-muted-foreground mb-4">📨</div>
          <h2 className="text-2xl font-semibold text-muted-foreground">Your Messages</h2>
          <p className="mt-2 text-muted-foreground">Select a conversation to start chatting.</p>
        </div>
      </div>
    </div>
  );
}
