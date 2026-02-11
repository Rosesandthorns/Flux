'use client';

import ChatArea from "@/components/layout/ChatArea";
import { useServerChannels, useServerMessages } from "@/firebase";
import React from "react";

interface ChannelPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}
export default function ChannelPage({ params: paramsProp }: ChannelPageProps) {
    const { serverId, channelId } = React.use(paramsProp);

    const { channels, loading: channelsLoading } = useServerChannels(serverId);
    const { messages, loading: messagesLoading } = useServerMessages(serverId, channelId);

    const activeChannel = channels?.find(c => c.id === channelId);

    return <ChatArea 
        serverId={serverId}
        activeChannel={activeChannel}
        messages={messages}
        messagesLoading={messagesLoading}
    />;
}
