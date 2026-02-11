import { Paperclip, Smile, AtSign, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type Contact = {
    id: string;
    name: string;
    avatarUrl: string;
    avatarHint: string;
    status: string;
};

interface DMChatAreaProps {
    contact: Contact;
}

export default function DMChatArea({ contact }: DMChatAreaProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="hidden h-12 shrink-0 items-center border-b border-border/50 px-4 md:flex">
        <div className="flex items-center">
          <AtSign className="h-6 w-6 text-muted-foreground" />
          <h2 className="ml-2 text-lg font-semibold">{contact.name}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
            </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
             <div className="flex items-start gap-4 pt-8 pl-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint={contact.avatarHint} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-2xl font-bold">{contact.name}</h3>
                    <p className="text-muted-foreground">This is the beginning of your direct message history with <span className="font-semibold text-foreground">@{contact.name}</span>.</p>
                </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <footer className="shrink-0 border-t border-border/50 p-4">
        <div className="relative">
          <Input
            placeholder={`Message @${contact.name}`}
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
