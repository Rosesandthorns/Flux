import { Hash, Pin, Users, Paperclip, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const messages = [
  { id: 1, user: 'Alice', avatarId: 'chat-avatar-1', time: '10:30 AM', text: "Hey everyone, what's up?" },
  { id: 2, user: 'Bob', avatarId: 'chat-avatar-2', time: '10:31 AM', text: "Not much, just working on the new Flux design. It's looking pretty sweet with that Electric Violet accent! 🚀" },
  { id: 3, user: 'Alice', avatarId: 'chat-avatar-1', time: '10:32 AM', text: 'I know right! The glassmorphism effect is fire. 🔥' },
  { id: 4, user: 'Charlie', avatarId: 'chat-avatar-3', time: '10:35 AM', text: 'Just joined. Did I hear glassmorphism? Count me in. Loving the deep charcoal theme.' },
];

const chatAvatars = PlaceHolderImages.filter(img => img.id.startsWith('chat-avatar-'));

export default function ChatArea() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="hidden h-12 shrink-0 items-center border-b border-border/50 px-4 md:flex">
        <div className="flex items-center">
          <Hash className="h-6 w-6 text-muted-foreground" />
          <h2 className="ml-2 text-lg font-semibold">general</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon"><Pin className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon"><Users className="h-5 w-5" /></Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((msg) => {
              const avatarData = chatAvatars.find(a => a.id === msg.avatarId);
              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {avatarData && <AvatarImage src={avatarData.imageUrl} alt={msg.user} data-ai-hint={avatarData.imageHint} />}
                    <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-primary">{msg.user}</p>
                      <p className="text-xs text-muted-foreground">{msg.time}</p>
                    </div>
                    <p className="text-foreground/90">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <footer className="shrink-0 border-t border-border/50 p-4">
        <div className="relative">
          <Input
            placeholder="Message #general"
            className="h-11 bg-secondary/80 pl-10 pr-16 text-base"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
