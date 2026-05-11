
import { AppLogo } from "@/components/app-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <AppLogo />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="hidden md:flex gap-4">
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Get Started</Link>
                </Button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">&copy; {new Date().getFullYear()} Vyapaar Sahayak. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
