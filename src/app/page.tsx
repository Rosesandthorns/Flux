import ServerRail from '@/components/layout/ServerRail';
import ChannelSidebar from '@/components/layout/ChannelSidebar';
import ChatArea from '@/components/layout/ChatArea';
import MobileHeader from '@/components/layout/MobileHeader';

export default function Home() {
  return (
    <>
      <div vaul-drawer-wrapper="" className="h-screen bg-background text-foreground">
        <div className="flex h-full">
          <div className="hidden md:flex flex-shrink-0">
            <ChannelSidebar />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <MobileHeader />
            <ChatArea />
          </div>
        </div>
      </div>
      <ServerRail />
    </>
  );
}
