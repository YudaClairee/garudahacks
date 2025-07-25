"use client"

import * as React from "react"

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
import { PiggyBank } from "lucide-react"
import Image from "next/image"
import logo from "/public/nabunglogo.png"
import Link from "next/link"

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
              <Link href="/dashboard">
                <Image src={logo} alt="NABUNG Logo" width={50} height={50} />
                <span className="text-base font-semibold">NABUNG.AI</span>
              </Link>
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
