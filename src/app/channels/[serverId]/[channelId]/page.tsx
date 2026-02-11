'use client';

import ChatArea from "@/components/layout/ChatArea";
import { useServerChannels, useServerMessages } from "@/firebase";

interface ChannelPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}
export default function ChannelPage({ params }: ChannelPageProps) {
    const { serverId, channelId } = params;

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