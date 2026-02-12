'use client';

import { useServerChannels, useServerMember, useUser } from "@/firebase";
import { redirect } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// This page is a redirector for desktop. It finds the first visible text channel and redirects to it.
// On mobile, it shows a message if no channels are visible, but does not redirect, allowing the channel list to be displayed.
export default function ServerPage({ params: paramsProp }: { params: { serverId: string } }) {
    const params = React.use(paramsProp);
    const { user } = useUser();
    const isMobile = useIsMobile();
    const { channels, loading: channelsLoading } = useServerChannels(params.serverId);
    const { data: member, loading: memberLoading } = useServerMember(params.serverId, user?.uid);
    const [isChecking, setIsChecking] = useState(true);

    const canManageServer = !memberLoading && (member?.role === 'owner' || member?.role === 'admin');

    const firstVisibleTextChannel = useMemo(() => {
        if (channelsLoading || memberLoading || !channels) return null;
        
        const textChannels = channels.filter(c => c.type === 'text');
        
        if (canManageServer) {
            return textChannels[0];
        }

        const visibleChannels = textChannels.filter(c => c.userAccess !== 'none');
        return visibleChannels[0];

    }, [channels, channelsLoading, member, memberLoading, canManageServer]);

    useEffect(() => {
        // Don't do anything until we know the viewport size and data is loaded.
        const allDataLoaded = !channelsLoading && !memberLoading;
        if (isMobile === undefined || !allDataLoaded) {
            return;
        }
        
        // On mobile, we don't redirect. The layout handles showing the channel list.
        // We just stop the loading spinner.
        if (isMobile) {
            setIsChecking(false);
            return;
        }

        // On desktop, redirect to the first available channel.
        if (firstVisibleTextChannel) {
            redirect(`/channels/${params.serverId}/${firstVisibleTextChannel.id}`);
        } else {
            // Or show the "no channels" message.
            setIsChecking(false);
        }
    }, [channelsLoading, memberLoading, firstVisibleTextChannel, params.serverId, isMobile]);

    if (isChecking) {
        return (
            <div className="flex-1 flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    // This view is only shown if there are no visible channels to the user.
    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
            <div className="text-center">
                <EyeOff className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">No Channels Visible</h2>
                <p className="mt-2 text-muted-foreground">You do not have access to any text channels in this server, or there are no channels.</p>
            </div>
        </div>
    );
}
