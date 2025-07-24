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
      title: "Data Penjualan",
      icon: ChartNoAxesCombined,
      href: "/dashboard/data-penjualan",
    },
    {
      title: "Produk",
      icon: ShoppingBasket,
      href: "/dashboard/produk",
    },
    {
      title: "Transaksi",
      icon: BanknoteArrowUp,
      href: "/dashboard/transaksi",
    },
    {
      title: "Insight AI",
      icon: Brain,
      href: "/dashboard/insight-ai",
    },
    {
      title: "Setelan",
      icon: Settings,
      href: "/dashboard/setelan",
    },
    {
      title: "Input CSV",
      icon: Upload,
      href: "/input-csv",
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
                className="sidebar-menu-item menu-item-enter"
                data-active={isActive}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={`
                    relative h-12 rounded-xl px-4 py-3 font-medium transition-all duration-300 ease-out
                    sidebar-menu-button-hover overflow-hidden group
                    ${isActive 
                      ? 'bg-indigo-400 text-white shadow-lg shadow-blue-600/25 border-indigo-800' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:border-l-4 hover:border-gray-300'
                    }
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400/20 before:to-blue-600/20 
                    before:translate-x-[-100%] before:transition-transform before:duration-300
                    hover:before:translate-x-0
                  `}
                >
                  <Link href={item.href} className="flex items-center gap-4 w-full relative z-10">
                    <Icon 
                      className={`
                        size-8 shrink-0 transition-all duration-200
                        ${isActive 
                          ? 'text-indigo-500' 
                          : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110'
                        }
                      `} 
                    />
                    <span className={`
                      text-sm font-semibold truncate transition-all duration-300
                      ${isActive 
                        ? 'text-black' 
                        : 'text-gray-700 group-hover:text-gray-900'
                      }
                    `}>
                      {item.title}
                    </span>
                    
                    {/* Subtle glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-600/10 animate-pulse" />
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
