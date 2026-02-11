'use client';

import { useServerChannels, useServerMember, useUser } from "@/firebase";
import { redirect } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, EyeOff } from "lucide-react";

// This page is a redirector. It finds the first visible text channel and redirects to it.
// If no text channels are visible to the user, it displays a message.
export default function ServerPage({ params: paramsProp }: { params: { serverId: string } }) {
    const params = React.use(paramsProp);
    const { user } = useUser();
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
        const allDataLoaded = !channelsLoading && !memberLoading;
        if (allDataLoaded) {
            if (firstVisibleTextChannel) {
                redirect(`/channels/${params.serverId}/${firstVisibleTextChannel.id}`);
            } else {
                // No visible channels, stop trying to redirect and show message.
                setIsChecking(false);
            }
        }
    }, [channelsLoading, memberLoading, firstVisibleTextChannel, params.serverId]);

    if (isChecking) {
        return (
            <div className="flex-1 flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
            <div className="text-center">
                <EyeOff className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">No Channels Visible</h2>
                <p className="mt-2 text-muted-foreground">You do not have access to any text channels in this server.</p>
            </div>
        </div>
    );
}
