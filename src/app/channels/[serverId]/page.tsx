'use client';

import { useServerChannels } from "@/firebase/servers/hooks";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

// This page is a redirector. It finds the first text channel in the server and redirects to it.
export default function ServerPage({ params: paramsProp }: { params: { serverId: string } }) {
    const params = React.use(paramsProp);
    const { channels, loading } = useServerChannels(params.serverId);

    useEffect(() => {
        if (!loading && channels) {
            const firstTextChannel = channels.find(c => c.type === 'text');
            if (firstTextChannel) {
                redirect(`/channels/${params.serverId}/${firstTextChannel.id}`);
            }
            // What if there are no text channels? We can show a placeholder page.
            // For now, we assume there will always be at least one.
        }
    }, [loading, channels, params.serverId]);

    return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )

}
