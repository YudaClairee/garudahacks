"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BanknoteArrowUp, Brain, ChartNoAxesCombined, LayoutDashboard, Settings, ShoppingBasket, FileSpreadsheet, Upload } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMain() {
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Sales",
      icon: ChartNoAxesCombined,
      href: "/dashboard/data-penjualan",
    },
    {
      title: "Product",
      icon: ShoppingBasket,
      href: "/dashboard/produk",
    },
    {
      title: "AI Insights",
      icon: Brain,
      href: "/dashboard/insight-ai",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/setelan",
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="px-3 py-2">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard');
            const Icon = item.icon;
            
            return (
              <SidebarMenuItem 
                key={item.href} 
                className="menu-item-enter"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={`
                    relative h-12 rounded-xl px-4 py-3 font-medium transition-all duration-300 ease-out
                    overflow-hidden group/button isolate
                    ${isActive 
                      ? 'bg-[#818cf8] dark:bg-[#818cf8] shadow-lg shadow-blue-600/25 border-indigo-800' 
                      : 'bg-transparent hover:bg-[#f8fafc] dark:hover:bg-[#374151] hover:shadow-md hover:border-l-4 hover:border-[#d1d5db] dark:hover:border-[#6b7280]'
                    }
                  `}
                >
                  <Link href={item.href} className="flex items-center gap-4 w-full relative z-10">
                    {/* Background gradient effect - hanya untuk item yang di-hover */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r transition-transform duration-300
                      ${isActive 
                        ? 'from-[#6366f1]/20 to-[#3b82f6]/20 translate-x-0' 
                        : 'from-[#3b82f6]/10 to-[#6366f1]/10 translate-x-[-100%] group-hover/button:translate-x-0'
                      }
                    `} />
                    
                    <Icon 
                      className={`
                        size-8 shrink-0 transition-all duration-200 relative z-20
                        ${isActive 
                          ? 'text-[#4f46e5] dark:text-[#4f46e5]' 
                          : 'text-[#6b7280] dark:text-[#9ca3af] group-hover/button:text-[#2563eb] dark:group-hover/button:text-[#3b82f6] group-hover/button:scale-110'
                        }
                      `} 
                    />
                    <span className={`
                      text-sm font-semibold truncate transition-all duration-300 relative z-20
                      ${isActive 
                        ? 'text-[#1e293b] dark:text-[#1e293b]' 
                        : 'text-[#374151] dark:text-[#d1d5db] group-hover/button:text-[#111827] dark:group-hover/button:text-[#f9fafb]'
                      }
                    `}>
                      {item.title}
                    </span>
                    
                    {/* Glow effect hanya untuk active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3b82f6]/10 to-[#6366f1]/10 animate-pulse" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
