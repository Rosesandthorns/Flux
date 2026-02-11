'use client'

import ChannelSidebar from "@/components/layout/ChannelSidebar";
import React from "react";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ServerLayoutProps {
    children: React.ReactNode;
    params: {
        serverId: string;
    }
}

export default function ServerLayout({ children, params: paramsProp }: ServerLayoutProps) {
    const params = useParams();
    const isMobile = useIsMobile();

    const hasChannelSelected = !!params.channelId;

    return (
        <div className="h-screen w-full">
            <div className="flex h-full overflow-hidden">
                {/* Channel Sidebar (Master View) */}
                <div className={cn(
                    "h-full",
                    isMobile ? "w-full" : "w-64 shrink-0",
                    isMobile && hasChannelSelected && "hidden"
                )}>
                    <ChannelSidebar serverId={paramsProp.serverId} />
                </div>
                
                {/* Chat Area (Detail View) */}
                <div className={cn(
                    "flex-1 flex flex-col bg-background",
                    isMobile && !hasChannelSelected && "hidden"
                )}>
                    {children}
                </div>
            </div>
        </div>
    )
}
