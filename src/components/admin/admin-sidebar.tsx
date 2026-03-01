"use client";

import * as React from "react";
import {
  Shield,
  Factory,
  Truck,
  Package,
  BarChart3,
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
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Admins",
    name: "Admins",
    url: "/admin/admins",
    icon: Shield,
  },
  {
    title: "Manufacturers",
    name: "Manufacturers",
    url: "/admin/manufacturers",
    icon: Factory,
  },
  {
    title: "Distributors",
    name: "Distributors",
    url: "/admin/distributors",
    icon: Truck,
  },
  {
    title: "Wholesalers",
    name: "Wholesalers",
    url: "/admin/wholesalers",
    icon: Package,
  },
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  const navMainWithActive = navItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }))

  const userData = {
    name: user?.fullName ?? "Admin",
    email: user?.email ?? "",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      {/* --- HEADER / LOGO --- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="flex items-center gap-3">
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
                  <span className="truncate text-xs">Admin Panel</span>
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
