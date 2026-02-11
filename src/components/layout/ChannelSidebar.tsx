"use client";

import { useState } from 'react';
import { ChevronDown, Hash, Mic, Settings, Volume2, Headphones } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const textChannels = ['general', 'random', 'dev-talk', 'design-critique'];
const voiceChannels = ['General', 'Gaming', 'Music'];
const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

export default function ChannelSidebar() {
  const [activeChannel, setActiveChannel] = useState('general');

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
            <button
              key={channel}
              className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              <span>{channel}</span>
            </button>
          ))}
        </div>
      </div>
      <footer className="mt-auto flex h-14 items-center border-t border-border/50 bg-background/30 px-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-semibold">Username</p>
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
