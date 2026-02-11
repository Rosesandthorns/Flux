"use client";
import { Menu, Hash } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ChannelSidebar from '@/components/layout/ChannelSidebar';
import { Button } from '@/components/ui/button';

export default function MobileHeader() {
  return (
    <header className="md:hidden flex h-12 shrink-0 items-center border-b border-border/50 px-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ChannelSidebar />
        </SheetContent>
      </Sheet>
      <div className="ml-2 flex items-center">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <h2 className="ml-1 text-base font-semibold">general</h2>
      </div>
    </header>
  );
}
