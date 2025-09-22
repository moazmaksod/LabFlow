
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { SidebarNav } from "./sidebar-nav";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { LifeBuoy, LogOut } from "lucide-react";


export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <Sidebar collapsible>
    <SidebarHeader className="flex flex-col items-center gap-2 p-2">
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                
                <div 
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground cursor-pointer"
                    onClick={() => {
                        if (state === 'collapsed') {
                            toggleSidebar();
                        }
                    }}
                >
                    <Icons.logo className="size-5" />
                </div>

                <div
                    data-sidebar="group-label"
                    className="text-lg font-semibold group-data-[collapsible=icon]:hidden"
                >
                    LabFlow
                </div>
            </div>
            
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
    </SidebarHeader>
    <SidebarContent className="p-2">
      <SidebarNav />
    </SidebarContent>
    <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Support" asChild>
                <Link href="/support">
                    <LifeBuoy />
                    <span>Support</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Log out">
                    <LogOut />
                    <span>Log out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
    </Sidebar>
  )
}
