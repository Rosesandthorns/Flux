'use client';

import { useState } from 'react';
import { Search, Check, X, Clock, Ban, UserPlus, Signal, Users, Settings, Mic, Headphones, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DMChatArea from './DMChatArea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import SettingsPage from './SettingsPage';
import { useUserProfile, useUser, useFirestore, useFriends, useFriendRequests, sendFriendRequest, acceptFriendRequest, declineOrCancelFriendRequest } from '@/firebase';
import { useToast } from "@/hooks/use-toast";
import type { FriendWithProfile, FriendRequestWithUserProfile } from '@/firebase/friends/types';
import { Skeleton } from '../ui/skeleton';

export default function DirectMessages() {
  const [selectedContact, setSelectedContact] = useState<FriendWithProfile | null>(null);
  const { data: userProfile } = useUserProfile();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { data: friends, loading: friendsLoading } = useFriends();
  const { data: pendingRequests, loading: requestsLoading } = useFriendRequests();
  
  const [addFriendHandle, setAddFriendHandle] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSendRequest = async () => {
    if (!user || !firestore || !addFriendHandle) return;

    setIsSendingRequest(true);
    try {
      await sendFriendRequest(firestore, user.uid, addFriendHandle);
      toast({
        title: "Success!",
        description: "Your friend request has been sent.",
      });
      setAddFriendHandle("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequestWithUserProfile) => {
    if (!firestore) return;
    try {
      await acceptFriendRequest(firestore, request.id!, request.fromUserId, request.toUserId);
      toast({
        title: "Friend Added!",
        description: `You are now friends with ${request.fromUserProfile.displayName}.`
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not accept friend request.",
      });
    }
  };
  
  const handleDeclineRequest = async (requestId: string) => {
    if (!firestore) return;
    try {
      await declineOrCancelFriendRequest(firestore, requestId);
      toast({
        title: "Request Declined",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not decline friend request.",
      });
    }
  };

  const onlineContacts = friends?.filter((c) => c.userProfile.status === 'Online') || [];

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <div className="w-full flex-shrink-0 border-r border-border/50 bg-secondary/30 flex flex-col md:w-80">
        <div className="p-4 pb-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Find or start a conversation" className="pl-9 bg-background" />
            </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden px-4 pt-4">
            <TooltipProvider>
                <TabsList className="flex items-center gap-3 bg-transparent p-0 h-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="online" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground p-2">
                                <Signal className="h-5 w-5" />
                            </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Online</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground p-2">
                                <Users className="h-5 w-5" />
                            </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>All Friends</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <TabsTrigger value="pending" className="relative data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground p-2">
                                <Clock className="h-5 w-5" />
                                {pendingRequests.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">{pendingRequests.length}</Badge>}
                            </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Pending</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="blocked" className="data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md text-muted-foreground hover:text-accent-foreground p-2">
                                <Ban className="h-5 w-5" />
                            </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Blocked</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <TabsTrigger value="add" className="text-green-500 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md font-semibold p-2">
                                <UserPlus className="h-5 w-5" />
                            </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Add Friend</p></TooltipContent>
                    </Tooltip>
                </TabsList>
            </TooltipProvider>
            <Separator className="my-3 bg-border/50" />

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <TabsContent value="online">
                    <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">Online — {onlineContacts.length}</h2>
                    {onlineContacts.length > 0 ? onlineContacts.map((contact) => (
                         <button key={contact.id} onClick={() => setSelectedContact(contact)} className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent ${selectedContact?.id === contact.id ? 'bg-accent' : ''}`}>
                            <Avatar className="h-10 w-10 relative">
                                <AvatarImage src={contact.userProfile.photoURL} alt={contact.userProfile.displayName} />
                                <AvatarFallback>{contact.userProfile.displayName.charAt(0)}</AvatarFallback>
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{contact.userProfile.displayName}</p>
                                <p className="text-xs text-muted-foreground">{contact.userProfile.status}</p>
                            </div>
                        </button>
                    )) : (
                        <div className="text-center text-muted-foreground p-8">No one's around.</div>
                    )}
                </TabsContent>
                <TabsContent value="all">
                     <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">All Friends — {friends?.length || 0}</h2>
                    {friendsLoading ? (
                      <div className="space-y-2 p-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : friends && friends.length > 0 ? friends.map((contact) => (
                        <button key={contact.id} onClick={() => setSelectedContact(contact)} className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent ${selectedContact?.id === contact.id ? 'bg-accent' : ''}`}>
                            <Avatar className="h-10 w-10 relative">
                                {contact.userProfile.photoURL && <AvatarImage src={contact.userProfile.photoURL} alt={contact.userProfile.displayName} />}
                                <AvatarFallback>{contact.userProfile.displayName.charAt(0)}</AvatarFallback>
                                {contact.userProfile.status === 'Online' && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                                )}
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{contact.userProfile.displayName}</p>
                                <p className="text-xs text-muted-foreground">{contact.userProfile.status}</p>
                            </div>
                        </button>
                    )) : (
                         <div className="text-center text-muted-foreground p-8">You have no friends. Try adding some!</div>
                    )}
                </TabsContent>
                <TabsContent value="pending">
                    <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground mb-2">Pending — {pendingRequests.length}</h2>
                    {requestsLoading ? (
                       <div className="space-y-2 p-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : pendingRequests.length > 0 ? (
                        <div className="space-y-1">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="flex w-full items-center rounded-md p-2 hover:bg-accent/80 justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {req.fromUserProfile.photoURL && <AvatarImage src={req.fromUserProfile.photoURL} alt={req.fromUserProfile.displayName} />}
                                            <AvatarFallback>{req.fromUserProfile.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{req.fromUserProfile.displayName}</p>
                                            <p className="text-xs text-muted-foreground">Incoming Friend Request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-400" onClick={() => handleAcceptRequest(req)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive/80" onClick={() => handleDeclineRequest(req.id!)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">There are no pending friend requests.</div>
                    )}
                </TabsContent>
                 <TabsContent value="blocked">
                     <div className="text-center text-muted-foreground p-8">
                        You don't have any blocked users.
                    </div>
                </TabsContent>
                <TabsContent value="add">
                    <div className="p-2">
                        <h2 className="text-lg font-bold uppercase">Add Friend</h2>
                        <p className="text-muted-foreground text-sm mt-1 mb-4">You can add a friend with their FluxID. It's case-sensitive!</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleSendRequest(); }} className="relative rounded-md bg-background/50">
                            <Input 
                              placeholder="Enter a username@flux" 
                              className="bg-transparent border-0 pr-48"
                              value={addFriendHandle}
                              onChange={(e) => setAddFriendHandle(e.target.value)}
                              disabled={isSendingRequest}
                            />
                            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 bg-primary hover:bg-primary/90" disabled={isSendingRequest || !addFriendHandle}>
                              {isSendingRequest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Send Friend Request
                            </Button>
                        </form>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
        <footer className="mt-auto flex h-14 items-center border-t border-border/50 bg-background/30 px-2">
            <div className="flex items-center">
                <Avatar className="h-8 w-8">
                    {userProfile?.photoURL && <AvatarImage src={userProfile.photoURL} alt="User Avatar" />}
                    <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                    <p className="text-sm font-semibold">{userProfile?.displayName || 'username'}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>
            <div className="ml-auto flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Headphones className="h-4 w-4" />
                </Button>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent showCloseButton={false} side="top" className="h-screen w-screen p-0 border-none">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Settings</SheetTitle>
                            <SheetDescription>
                            Manage your account and application settings.
                            </SheetDescription>
                        </SheetHeader>
                        <SettingsPage />
                    </SheetContent>
                </Sheet>
            </div>
        </footer>
      </div>

      {/* Main chat view */}
      <div className="hidden md:flex flex-1 flex-col bg-background">
        {selectedContact ? (
            <DMChatArea 
                contact={selectedContact}
            />
        ) : (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-5xl text-muted-foreground mb-4">📨</div>
                    <h2 className="text-2xl font-semibold text-muted-foreground">Your Messages</h2>
                    <p className="mt-2 text-muted-foreground">Select a conversation to start chatting.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
