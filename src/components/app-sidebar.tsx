"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
const baseurl = process.env.NEXT_PUBLIC_BASE_URL

import {
  LayoutDashboard,
  Users,
  Bell,
  BookUser,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: "/admin/Lead",
    icon: Users,
  },
  {
    title: "Reminders",
    url: "/admin/reminders",
    icon: Bell,
  },
  {
    title: "Customer",
    url: "/admin/contactinfo",
    icon: BookUser,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart2,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]



export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [username, setUsername] = useState<string | null>(null);
  const [profession, setprofesion] = useState<string | null>(null);
  const [loading, setloading] = useState(true);

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL
  const [userid, setUserid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(`${baseurl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserid(res.data.id); // or res.data.user_id depending on backend
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  async function getUsername() {
    try {
      setloading(true);
      const response = await axios.get(`${baseurl}/adminplus/${userid}`);
      setUsername(response.data);
      console.log(response.data);

      setloading(false);
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    if (!userid) return;
    getUsername();
  }, [userid]);


  async function getProfession() {
    try {
      setloading(true);
      const response = await axios.get(`${baseurl}/admin/${userid}`);
      setprofesion(response.data);
      console.log(response.data);

      setloading(false);
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (!userid) return;
    getProfession();
  }, [userid]);



  const handleLogout = async () => {
    try {
      await axios.post(
        `${baseurl}/logout`,
        {},
        {
          withCredentials: true, // sends cookies
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 [&>[data-sidebar=sidebar]]:bg-[#0f172a] [&>[data-sidebar=sidebar]]:text-slate-300"
    >
      {/* ── Header / Branding ─────────────────────────────────────── */}
      <SidebarHeader className="border-b border-slate-700/60 px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-900/40">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          {/* Brand text — hidden in icon-collapsed mode */}
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white tracking-wide">
              Nexus CRM
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Enterprise Suite
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={[
                        "h-9 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                        "text-slate-400 hover:text-white hover:bg-slate-700/50",
                        isActive
                          ? "!bg-blue-600 !text-white shadow-sm shadow-blue-900/40 hover:!bg-blue-500"
                          : "",
                      ].join(" ")}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User + Logout ─────────────────────────────────── */}
      <SidebarFooter className="border-t border-slate-700/60 p-3 space-y-1">
        {/* User info row */}
        <div className="flex items-center gap-3 px-1 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            AR
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {username}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {profession}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="h-9 rounded-lg px-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}