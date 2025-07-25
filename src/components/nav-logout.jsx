"use client"

import {
  IconLogout,
} from "@tabler/icons-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavLogout() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Link href="/" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg p-2 w-full flex items-center transition-colors">
          <IconLogout className="size-6" />
          <span className="text-lg ">Keluar</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
