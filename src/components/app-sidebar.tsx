"use client";

import * as React from "react";
import {
  Map,
  PieChart,
  Receipt,
  Settings,
  LayoutDashboard,
  User,
} from "lucide-react";

import Link from "next/link";

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
} from "@/components/ui/sidebar"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useUser } from "@/contexts/user-context"

const navItems = [
  {
    title: "Dashboard",
    name: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    name: "Products",
    url: "/products",
    icon: PieChart,
  },
  {
    title: "Transactions",
    name: "Transactions",
    url: "/transactions",
    icon: Receipt,
  },
  {
    title: "Reports",
    name: "Reports",
    url: "/reports",
    icon: Map,
  },
  {
    title: "User Management",
    name: "User Management",
    url: "/users",
    icon: User,
  },
];

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  const navMainWithActive = navItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }))

  const userData = {
    name: user?.fullName ?? "Loading...",
    email: user?.email ?? "",
    avatar: "/avatars/shadcn.jpg",
  }

  const roleLabel = user?.role ? formatRole(user.role) : "User"

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      {/* --- HEADER / LOGO --- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="PharmaChain"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-foreground text-left text-sm leading-tight">
                  <span className="truncate font-medium">PharmaChain</span>
                  <span className="truncate text-xs">{roleLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- MAIN NAV LINKS --- */}
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>

      {/* --- USER FOOTER --- */}
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
