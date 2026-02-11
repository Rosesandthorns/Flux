'use client';

import { useState, useEffect } from 'react';
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
import { updateChannel, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { Channel } from '@/firebase/servers/types';
import { Slider } from '../ui/slider';

interface EditChannelDialogProps {
  serverId: string;
  channel: Channel;
  children: React.ReactNode;
}

export default function EditChannelDialog({ serverId, channel, children }: EditChannelDialogProps) {
    const [open, setOpen] = useState(false);
    const [channelName, setChannelName] = useState(channel.name);
    const [channelTopic, setChannelTopic] = useState(channel.topic || '');
    const [userAccess, setUserAccess] = useState<'readwrite' | 'readonly' | 'none'>(channel.userAccess || 'readwrite');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    useEffect(() => {
        if (open) {
            setChannelName(channel.name);
            setChannelTopic(channel.topic || '');
            setUserAccess(channel.userAccess || 'readwrite');
        }
    }, [open, channel]);
    
    const permissionLevels = [
        { value: 'none', label: "Users can't see or type" },
        { value: 'readonly', label: "Users can see" },
        { value: 'readwrite', label: "Users can see and type" },
    ];
    
    const sliderValueMap: {[key: string]: number} = { 'none': 0, 'readonly': 1, 'readwrite': 2 };
    const valueSliderMap: Array<'none' | 'readonly' | 'readwrite'> = ['none', 'readonly', 'readwrite'];
    
    const handleSliderChange = (value: number[]) => {
        setUserAccess(valueSliderMap[value[0]]);
    }

    const handleUpdateChannel = async () => {
        if (!firestore || !serverId || !channel.id || !channelName) return;

        setIsLoading(true);
        try {
            const updates: Partial<Channel> = {};
            if (channelName !== channel.name) updates.name = channelName;
            if (channelTopic !== (channel.topic || '')) updates.topic = channelTopic;
            if (userAccess !== (channel.userAccess || 'readwrite')) updates.userAccess = userAccess;

            if (Object.keys(updates).length > 0) {
                await updateChannel(firestore, serverId, channel.id, updates);
                toast({
                    title: 'Channel Updated!',
                    description: `#${channelName} has been updated.`,
                });
            }
            setOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error updating channel',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="z-[103]">
                <DialogHeader>
                    <DialogTitle>Edit #{channel.name}</DialogTitle>
                    <DialogDescription>
                        Update channel settings. Changes will be applied immediately.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={(e) => { e.preventDefault(); handleUpdateChannel(); }} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="channel-name-form-edit" className="text-left">Channel Name</Label>
                        <Input
                            id="channel-name-form-edit"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                        />
                         <p className="text-xs text-muted-foreground">Channel names must be lowercase, with no spaces.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="channel-topic-form-edit" className="text-left">Channel Topic</Label>
                        <Input
                            id="channel-topic-form-edit"
                            placeholder="Let everyone know what this channel is about"
                            value={channelTopic}
                            onChange={(e) => setChannelTopic(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>User Permissions</Label>
                        <p className="text-sm text-muted-foreground">{permissionLevels.find(p => p.value === userAccess)?.label}</p>
                        <Slider 
                            value={[sliderValueMap[userAccess]]} 
                            onValueChange={handleSliderChange}
                            max={2} 
                            step={1} 
                            className="pt-2"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || !channelName}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
}
