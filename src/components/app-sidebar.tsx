"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

import {
  LayoutDashboard,
  Users,
  Bell,
  BookUser,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";

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
    url: "/admin/Reminders",
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
];

// Turns "Ali Raza" -> "AR", a single word -> first two letters, empty -> "—"
function getInitials(name: string | null) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const [username, setUsername] = useState<string | null>(null);
  const [profession, setprofesion] = useState<string | null>(null);
  const [loading, setloading] = useState(true);

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const [userid, setUserid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(`${baseurl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      console.log(err);
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
      console.log(err);
    }
  }

  useEffect(() => {
    if (!userid) return;
    getProfession();
  }, [userid]);

  

  // Close the mobile drawer after a nav item is tapped, so the sheet
  // doesn't stay open over the page you just navigated to.
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const initials = getInitials(username);

  return (
    <Sidebar
  collapsible="icon"
  className="border-r-0 bg-gradient-to-b from-[#4F46E5] via-[#5B4CF0] to-[#6D28D9] text-white"
>
      {/* ── Header / Branding ─────────────────────────────────────── */}
      <SidebarHeader className="border-b border-white/[0.06] px-3 py-4 sm:px-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/50 ring-1 ring-white/10">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          {/* Brand text — hidden in icon-collapsed mode */}
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-wide text-white">
              Nexora
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Enterprise Suite
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={[
                        "group/nav relative h-10 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                        isActive
                          ? "bg-indigo-500/15 text-white"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      <Link
                        href={item.url}
                        onClick={handleNavClick}
                        className="flex items-center gap-3"
                      >
                        {/* active indicator bar */}
                        <span
                          aria-hidden
                          className={[
                            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-indigo-400 transition-opacity duration-150",
                            isActive ? "opacity-100" : "opacity-0",
                          ].join(" ")}
                        />
                        <item.icon
                          className={[
                            "size-4 shrink-0 transition-colors",
                            isActive
                              ? "text-indigo-300"
                              : "text-slate-500 group-hover/nav:text-slate-200",
                          ].join(" ")}
                        />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User + Logout ─────────────────────────────────── */}
      <SidebarFooter className="space-y-1 border-t border-white/[0.06] p-3">
        {/* User info row */}
        <div className="flex items-center gap-3 px-1 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white ring-1 ring-white/10">
            {initials}
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            {loading ? (
              <>
                <span className="mb-1 h-3 w-24 animate-pulse rounded bg-slate-700/50" />
                <span className="h-2.5 w-16 animate-pulse rounded bg-slate-800/50" />
              </>
            ) : (
              <>
                <span className="truncate text-sm font-semibold text-white">
                  {username}
                </span>
                <span className="truncate text-[11px] text-slate-500">
                  {profession}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Logout button */}
        
      </SidebarFooter>
    </Sidebar>
  );
}