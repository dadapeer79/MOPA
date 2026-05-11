import { Wallet } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
      <div className="p-2 bg-sidebar-primary/10 dark:bg-sidebar-primary/20 rounded-lg">
        <Wallet className="h-6 w-6 text-sidebar-primary" />
      </div>
      <h1
        className="text-xl font-bold text-foreground font-headline group-data-[collapsible=icon]:hidden">
        Vyapaar Sahayak
      </h1>
    </Link>
  );
}
