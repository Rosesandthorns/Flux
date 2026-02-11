'use client'

import ChannelSidebar from "@/components/layout/ChannelSidebar";
import ServerRail from "@/components/layout/ServerRail";

interface ServerLayoutProps {
    children: React.ReactNode;
    params: {
        serverId: string;
    }
}

export default function ServerLayout({ children, params }: ServerLayoutProps) {
    return (
        <div vaul-drawer-wrapper="" className="h-screen w-full flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <ChannelSidebar serverId={params.serverId} />
                {children}
            </div>
            <ServerRail activeServerId={params.serverId} />
        </div>
    )
}
