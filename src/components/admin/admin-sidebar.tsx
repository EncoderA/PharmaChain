"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Factory,
  Truck,
  Package,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Admins",
    href: "/admin/admins",
    icon: Shield,
  },
  {
    title: "Manufacturers",
    href: "/admin/manufacturers",
    icon: Factory,
  },
  {
    title: "Distributors",
    href: "/admin/distributors",
    icon: Truck,
  },
  {
    title: "Wholesalers",
    href: "/admin/wholesalers",
    icon: Package,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/admin"
                className="flex items-center gap-3 w-full px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent">
                  <Image
                    src="/logo.svg"
                    alt="PharmaChain"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-foreground text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium text-foreground">Admin Panel</span>
                  <span className="truncate text-xs text-foreground/70">Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 w-full px-4 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
                    >
                      <Icon className="h-5 w-5 text-foreground/95" />
                      <span className="ml-2 group-data-[collapsible=icon]:hidden text-foreground">{item.title}</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
