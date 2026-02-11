"use client";

import { useState } from 'react';
import { ChevronDown, Hash, Mic, Settings, Volume2, Headphones, MicOff, X, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import SettingsPage from './SettingsPage';
import { useVoice } from '@/context/VoiceContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserProfile, useServer, useServerChannels } from '@/firebase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChannelSidebar({ serverId }: { serverId: string }) {
  const params = useParams();
  const { channelId } = params;
  
  const { data: server, loading: serverLoading } = useServer(serverId);
  const { channels, loading: channelsLoading } = useServerChannels(serverId);

  const textChannels = channels?.filter(c => c.type === 'text') || [];
  const voiceChannels = channels?.filter(c => c.type === 'voice') || [];
  
  const {
    activeVoiceChannel,
    participants,
    speakingParticipantId,
    isMuted,
    isDeafened,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
  } = useVoice();
  const { data: userProfile } = useUserProfile();

  const effectiveMute = isMuted || isDeafened;

  return (
    <div className="flex h-full w-64 flex-col bg-secondary/30 backdrop-blur-xl shrink-0">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-primary">{server?.name || 'Server'}</h1>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-bold uppercase text-muted-foreground">Text Channels</h2>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Channel</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          {textChannels.map((channel) => (
            <Link
                key={channel.id}
                href={`/channels/${serverId}/${channel.id}`}
                className={cn(
                    'flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    channelId === channel.id ? 'bg-accent text-accent-foreground' : ''
                )}
            >
                <Hash className="mr-2 h-4 w-4" />
                <span>{channel.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex justify-between items-center px-2">
            <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground">Voice Channels</h2>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Channel</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          {voiceChannels.map((channel) => (
            <div key={channel.id}>
              <button
                onClick={() => joinChannel(channel.name)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeVoiceChannel === channel.name && "bg-accent text-accent-foreground"
                )}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                <span>{channel.name}</span>
              </button>
              {activeVoiceChannel === channel.name && (
                <div className="pt-2 pl-4">
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((p) => (
                        <Tooltip key={p.id}>
                          <TooltipTrigger>
                            <Avatar className={cn(
                                'h-8 w-8 ring-2 ring-offset-background ring-offset-2 transition-all',
                                speakingParticipantId === p.id && !isDeafened ? 'ring-primary' : 'ring-transparent'
                            )}>
                              <AvatarImage src={p.avatarUrl} alt={p.name} />
                              <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{p.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}
            </div>
          ))}
        </div>
         {(textChannels.length === 0 && voiceChannels.length === 0) && !channelsLoading && (
            <div className="text-center text-muted-foreground p-8">
                No channels here.
            </div>
        )}
      </div>
       {activeVoiceChannel && (
          <div className="shrink-0 border-t border-border/50 bg-background/30 p-2">
              <div className="flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold uppercase text-green-500">Voice Connected</p>
                      <p className="text-sm text-muted-foreground">{activeVoiceChannel}</p>
                  </div>
                  <Button variant="destructive" size="icon" className="h-7 w-7" onClick={leaveChannel}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Disconnect</span>
                  </Button>
              </div>
          </div>
        )}
      <footer className="flex h-14 items-center border-t border-border/50 bg-background/30 px-2">
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
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", effectiveMute && "text-destructive hover:text-destructive/80")} onClick={toggleMute}>
            {effectiveMute ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", isDeafened && "text-destructive hover:text-destructive/80 relative")} onClick={toggleDeafen}>
            <Headphones className="h-4 w-4" />
            {isDeafened && <div className="absolute w-[18px] h-0.5 bg-destructive rotate-45" />}
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
  );
}
