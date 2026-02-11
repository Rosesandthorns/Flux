'use client';

import ChatArea from "@/components/layout/ChatArea";
import { useServerChannels, useServerMessages, useServerMember, useUser } from "@/firebase";
import React from "react";
import { redirect } from "next/navigation";
import { EyeOff, Loader2 } from "lucide-react";

interface ChannelPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}
export default function ChannelPage({ params: paramsProp }: ChannelPageProps) {
    const { serverId, channelId } = React.use(paramsProp);
    const { user } = useUser();

    const { channels, loading: channelsLoading } = useServerChannels(serverId);
    const { data: member, loading: memberLoading } = useServerMember(serverId, user?.uid);
    const { messages, loading: messagesLoading } = useServerMessages(serverId, channelId);

    const canManageServer = !memberLoading && (member?.role === 'owner' || member?.role === 'admin');
    const activeChannel = channels?.find(c => c.id === channelId);

    if (channelsLoading || memberLoading) {
        return (
            <div className="flex-1 flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const canSeeChannel = canManageServer || (activeChannel && activeChannel.userAccess !== 'none');

    if (!activeChannel || !canSeeChannel) {
        // This channel doesn't exist, or user doesn't have access.
        // Redirect to the server's root, which will find a valid channel or show the "no channels" message.
        redirect(`/channels/${serverId}`);
    }

    return <ChatArea 
        serverId={serverId}
        activeChannel={activeChannel}
        member={member}
        messages={messages}
        messagesLoading={messagesLoading}
    />;
}
