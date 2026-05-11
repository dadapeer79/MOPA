
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  FileText,
  LineChart,
  IndianRupee,
  MessageSquare,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/procurement", label: "Procurement", icon: Bot },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/expenses", label: "Expenses", icon: IndianRupee },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/dashboard/policies", label: "Insurance", icon: ShieldCheck },
  { href: "/dashboard/learning", label: "Learning Hub", icon: GraduationCap },
];

export function MainNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarMenu className="p-2">
      {links.map((link) => {
        const isActive = isClient ? pathname === link.href : false;
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={link.label} className="text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground">
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
