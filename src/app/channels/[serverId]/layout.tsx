'use client'

import ChannelSidebar from "@/components/layout/ChannelSidebar";
import React from "react";

interface ServerLayoutProps {
    children: React.ReactNode;
    params: {
        serverId: string;
    }
}

export default function ServerLayout({ children, params: paramsProp }: ServerLayoutProps) {
    const params = React.use(paramsProp);
    return (
        <div className="h-screen w-full">
            <div className="flex h-full overflow-hidden">
                <ChannelSidebar serverId={params.serverId} />
                {children}
            </div>
        </div>
    )
}
