'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createChannel, useFirestore } from '@/firebase';
import { Loader2, Hash, Volume2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Channel } from '@/firebase/servers/types';

interface CreateChannelDialogProps {
  serverId: string;
  channelType: 'text' | 'voice';
  children: React.ReactNode;
}

export default function CreateChannelDialog({ serverId, channelType: initialType, children }: CreateChannelDialogProps) {
    const [open, setOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [channelType, setChannelType] = useState<Channel['type']>(initialType);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleCreateChannel = async () => {
        if (!firestore || !serverId || !channelName) return;

        setIsLoading(true);
        try {
            await createChannel(firestore, serverId, { name: channelName, type: channelType });
            toast({
                title: 'Channel Created!',
                description: `#${channelName} is now live.`,
            });
            setOpen(false);
            setChannelName('');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error creating channel',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Give your new channel a name and type.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={(e) => { e.preventDefault(); handleCreateChannel(); }} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Channel Type</Label>
                        <RadioGroup defaultValue={channelType} onValueChange={(v) => setChannelType(v as Channel['type'])}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="text" id="type-text" />
                                <Label htmlFor="type-text" className="flex items-center gap-2 font-normal">
                                    <Hash className="h-4 w-4" /> Text
                                </Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="voice" id="type-voice" />
                                <Label htmlFor="type-voice" className="flex items-center gap-2 font-normal">
                                    <Volume2 className="h-4 w-4" /> Voice
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="channel-name-form" className="text-left">Channel Name</Label>
                        <Input
                            id="channel-name-form"
                            placeholder="new-channel"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                        />
                         <p className="text-xs text-muted-foreground">Channel names must be lowercase, with no spaces.</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || !channelName}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Channel
                        </Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
}
