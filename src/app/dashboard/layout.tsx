
'use client';

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from 'next/dynamic';

const MainNav = dynamic(() => import('@/components/main-nav-client').then(mod => mod.MainNav), { ssr: false });

type ProfileData = {
  name?: string;
  email?: string;
  storeName?: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const router = useRouter();

  useEffect(() => {
    const storedAvatar = localStorage.getItem('userAvatar');
    const storedProfile = localStorage.getItem('userProfile');

    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    const handleStorageChange = () => {
      const updatedAvatar = localStorage.getItem('userAvatar');
      const updatedProfile = localStorage.getItem('userProfile');
      if (updatedAvatar) {
        setAvatar(updatedAvatar);
      }
      if (updatedProfile) {
        setProfile(JSON.parse(updatedProfile));
      } else {
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings" className="flex-1">
              <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground" suppressHydrationWarning>
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          <div className="w-full border-t border-sidebar-border" />
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar ?? undefined} alt="User" />
              <AvatarFallback>{profile.name?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-foreground">{profile.name ?? 'Retailer'}</span>
              <span className="text-xs text-sidebar-foreground/70">{profile.storeName ?? 'Store Owner'}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/90 backdrop-blur-sm px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
