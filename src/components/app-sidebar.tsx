"use client"

import * as React from "react"
import {
  Map,
  PieChart,
  Receipt,
  Settings,
 LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
      title: "Settings",
      name: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
 
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navMainWithActive = data.navMain.map((item) => ({
    ...item, 
    isActive: pathname.startsWith(item.url),
  }))
  console.log("Current Pathname:", pathname, navMainWithActive)
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className=" flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="PharmaChain"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">PharmaChain</span>
                  <span className="truncate text-xs">Manufactuer</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
