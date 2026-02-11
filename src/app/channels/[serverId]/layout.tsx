'use client'

import ChannelSidebar from "@/components/layout/ChannelSidebar";

interface ServerLayoutProps {
    children: React.ReactNode;
    params: {
        serverId: string;
    }
}

export default function ServerLayout({ children, params }: ServerLayoutProps) {
    return (
        <div vaul-drawer-wrapper="" className="h-screen w-full">
            <div className="flex h-full overflow-hidden">
                <ChannelSidebar serverId={params.serverId} />
                {children}
            </div>
        </div>
    )
}
