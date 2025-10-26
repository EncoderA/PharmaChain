"use client";

import * as React from "react";
import {
  Map,
  PieChart,
  Receipt,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ✅ Keep static data OUTSIDE the component to avoid re-render mismatches
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      name: "Products",
      url: "/dashboard/products",
      icon: PieChart,
    },
    {
      title: "Transactions",
      name: "Transactions",
      url: "/dashboard/transactions",
      icon: Receipt,
    },
    {
      title: "Reports",
      name: "Reports",
      url: "/dashboard/reports",
      icon: Map,
    },
    {
      title: "Settings",
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      {/* --- HEADER / LOGO --- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {/* ✅ Use Link (not <a href="#">) to avoid hydration issues */}
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="PharmaChain"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">PharmaChain</span>
                  <span className="truncate text-xs">Manufacturer</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- MAIN NAV LINKS --- */}
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* --- USER FOOTER --- */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
