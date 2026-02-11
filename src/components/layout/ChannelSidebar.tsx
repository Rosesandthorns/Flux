'use client';

import {
  ChevronDown,
  Hash,
  Mic,
  Settings,
  Volume2,
  Headphones,
  MicOff,
  X,
  Plus,
  Copy,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import SettingsPage from './SettingsPage';
import { useVoice } from '@/context/VoiceContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserProfile, useServer, useServerChannels, useUser, useServerMember, useFirestore, leaveServer, useChannelParticipants } from '@/firebase';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CreateChannelDialog from '../servers/CreateChannelDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '../ui/input';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import EditChannelDialog from '../servers/EditChannelDialog';

function VoiceChannelEntry({ serverId, channel, canManageServer }: { serverId: string, channel: any, canManageServer: boolean }) {
    const { activeVoiceChannel, joinChannel, speakingPeers } = useVoice();
    const { participants } = useChannelParticipants(serverId, channel.id);

    return (
        <div key={channel.id}>
            <div className="group relative flex items-center pr-2">
                <button
                  onClick={() => joinChannel(serverId, channel.id!, channel.name)}
                  className={cn(
                    'flex flex-1 items-center rounded-md py-1.5 pl-2 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    activeVoiceChannel?.channelId === channel.id && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  <span>{channel.name}</span>
                </button>
                {canManageServer && (
                    <EditChannelDialog serverId={serverId} channel={channel}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </EditChannelDialog>
                )}
            </div>
             {participants && participants.length > 0 && (
                <div className="pt-2 pl-6">
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((p) => (
                        <Tooltip key={p.userId}>
                          <TooltipTrigger>
                            <Avatar
                              className={cn(
                                'h-8 w-8 ring-2 ring-offset-background ring-offset-2 transition-all ring-transparent',
                                speakingPeers.has(p.peerId) && 'ring-green-500'
                              )}
                            >
                              <AvatarImage src={p.photoURL} alt={p.displayName} />
                              <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{p.displayName}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}
        </div>
    );
}

export default function ChannelSidebar({ serverId }: { serverId: string }) {
  const params = useParams();
  const router = useRouter();
  const { channelId } = params;
  const { toast } = useToast();
  
  const { data: server, loading: serverLoading } = useServer(serverId);
  const { channels, loading: channelsLoading } = useServerChannels(serverId);
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: member, loading: memberLoading } = useServerMember(serverId, user?.uid);
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);

  const canManageServer = !memberLoading && (member?.role === 'owner' || member?.role === 'admin');

  const visibleChannels = useMemo(() => {
    if (!channels || memberLoading) return [];
    if (canManageServer) return channels;
    return channels.filter(c => c.userAccess !== 'none');
  }, [channels, canManageServer, memberLoading]);

  const textChannels = visibleChannels?.filter((c) => c.type === 'text') || [];
  const voiceChannels = visibleChannels?.filter((c) => c.type === 'voice') || [];

  const {
    activeVoiceChannel: vc,
    isMuted,
    isDeafened,
    leaveChannel,
    toggleMute,
    toggleDeafen,
  } = useVoice();
  const { data: userProfile } = useUserProfile();

  const effectiveMute = isMuted || isDeafened;

  const handleCopyInvite = () => {
    if (!server?.inviteCode) return;
    navigator.clipboard.writeText(server.inviteCode);
    toast({
        title: "Copied!",
        description: "Invite code copied to clipboard.",
    });
  }

  const handleLeaveServer = async () => {
    if (!firestore || !user) return;
    try {
      await leaveServer(firestore, serverId, user.uid);
      toast({
        title: `Left Server`,
        description: `You have left ${server?.name}.`,
      });
      router.push('/');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not leave server.",
        });
    } finally {
        setShowLeaveAlert(false);
    }
  }

  return (
    <div className="relative z-10 flex h-full w-64 flex-col bg-secondary/30 backdrop-blur-xl shrink-0">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-primary">
          {server?.name || 'Server'}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {canManageServer && <DropdownMenuItem onSelect={() => setShowInviteDialog(true)}>Invite People</DropdownMenuItem>}
            {canManageServer && <DropdownMenuItem>Server Settings</DropdownMenuItem>}
            {canManageServer && <DropdownMenuSeparator />}
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setShowLeaveAlert(true)}>
              Leave Server
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-bold uppercase text-muted-foreground">
              Text Channels
            </h2>
            {canManageServer && (
              <CreateChannelDialog serverId={serverId} channelType="text">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CreateChannelDialog>
            )}
          </div>
          {textChannels.map((channel) => (
             <div key={channel.id} className="group relative flex items-center pr-2">
              <Link
                href={`/channels/${serverId}/${channel.id}`}
                className={cn(
                  'flex flex-1 items-center rounded-md py-1.5 pl-2 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  channelId === channel.id ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span>{channel.name}</span>
              </Link>
              {canManageServer && (
                <EditChannelDialog serverId={serverId} channel={channel}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </EditChannelDialog>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex justify-between items-center px-2">
            <h2 className="px-2 text-xs font-bold uppercase text-muted-foreground">
              Voice Channels
            </h2>
            {canManageServer && (
              <CreateChannelDialog serverId={serverId} channelType="voice">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CreateChannelDialog>
            )}
          </div>
           {voiceChannels.map((channel) => (
              <VoiceChannelEntry key={channel.id} serverId={serverId} channel={channel} canManageServer={canManageServer} />
          ))}
        </div>
        {textChannels.length === 0 &&
          voiceChannels.length === 0 &&
          !channelsLoading && (
            <div className="text-center text-muted-foreground p-8">
              No channels here.
            </div>
          )}
      </div>
      {vc && (
        <div className="shrink-0 border-t border-border/50 bg-background/30 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-green-500">
                Voice Connected
              </p>
              <p className="text-sm text-muted-foreground">
                {vc.channelName}
              </p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={leaveChannel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Disconnect</span>
            </Button>
          </div>
        </div>
      )}
      <footer className="flex h-14 items-center border-t border-border/50 bg-background/30 px-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {userProfile?.photoURL && (
              <AvatarImage src={userProfile.photoURL} alt="User Avatar" />
            )}
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-semibold">
              {userProfile?.displayName || 'username'}
            </p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="ml-auto flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              effectiveMute && 'text-destructive hover:text-destructive/80'
            )}
            onClick={toggleMute}
          >
            {effectiveMute ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              isDeafened && 'text-destructive hover:text-destructive/80 relative'
            )}
            onClick={toggleDeafen}
          >
            <Headphones className="h-4 w-4" />
            {isDeafened && (
              <div className="absolute w-[18px] h-0.5 bg-destructive rotate-45" />
            )}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              showCloseButton={false}
              side="top"
              className="h-screen w-screen p-0 border-none z-[111]"
            >
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

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Invite friends to {server?.name}</DialogTitle>
                <DialogDescription>
                    Share this invite code to allow others to join your server.
                </DialogDescription>
            </DialogHeader>
            <div className="relative rounded-md bg-background/50">
                <Input id="invite-code" readOnly value={server?.inviteCode || ''} className="pr-20"/>
                <Button type="button" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8" onClick={handleCopyInvite}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Leave Server Alert */}
      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Leave '{server?.name}'?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Are you sure you want to leave this server? You won't be able to rejoin unless you are invited back.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeaveServer} className={cn(buttonVariants({ variant: "destructive" }))}>
                      Leave Server
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
