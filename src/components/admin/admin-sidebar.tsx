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
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
