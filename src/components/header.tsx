'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold">PropVisor</h1>
      </div>
    </header>
  );
}
