"use client";

import { useState } from 'react';
import { ChevronDown, Hash, Mic, Settings, Volume2, Headphones, MicOff, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import SettingsPage from './SettingsPage';
import { useVoice } from '@/context/VoiceContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const textChannels = ['general', 'random', 'dev-talk', 'design-critique'];
const voiceChannels = ['General', 'Gaming', 'Music'];
const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

export default function ChannelSidebar() {
  const [activeChannel, setActiveChannel] = useState('general');
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

  const effectiveMute = isMuted || isDeafened;

  return (
    <div className="flex h-full w-64 flex-col bg-secondary/30 backdrop-blur-xl">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-primary">Flux</h1>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground">Text Channels</h2>
          {textChannels.map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
                activeChannel === channel ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <Hash className="mr-2 h-4 w-4" />
              <span>{channel}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground">Voice Channels</h2>
          {voiceChannels.map((channel) => (
            <div key={channel}>
              <button
                onClick={() => joinChannel(channel)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeVoiceChannel === channel && "bg-accent text-accent-foreground"
                )}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                <span>{channel}</span>
              </button>
              {activeVoiceChannel === channel && (
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
                              <AvatarImage src={p.avatarUrl} alt={p.name} data-ai-hint={p.avatarHint} />
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
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-semibold">username</p>
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
