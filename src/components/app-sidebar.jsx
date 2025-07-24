"use client"

import * as React from "react"
import {
  IconChefHat,
  IconDashboard,
  IconShoppingCart,
  IconToolsKitchen2,
  IconUsers,
  IconCreditCard,
  IconReport,
  IconSettings,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavLogout, NavUser } from "@/components/nav-logout"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Aliden Anovi",
    email: "aliden@hirechef.com",
    avatar: "/avatars/aliden.jpg",
  },
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconChefHat className="!size-5" />
                <span className="text-base font-semibold">Hire Chef</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
