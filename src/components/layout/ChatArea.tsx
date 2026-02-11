import { Hash, Pin, Users, Paperclip, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const messages: { id: number, user: string, avatarId: string, time: string, text: string }[] = [];

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
            {messages.length > 0 ? messages.map((msg) => {
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
            }) : (
              <div className="flex items-start gap-4 pt-8 pl-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Hash className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">Welcome to #general!</h3>
                    <p className="text-muted-foreground">This is the beginning of the #general channel.</p>
                </div>
              </div>
            )}
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
