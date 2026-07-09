'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, TrendingUp, DollarSign, BarChart3,
  Download, Calendar, Mail, Phone, UserPlus,
  CheckCircle2, Bell, HelpCircle, Settings, Search,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, change, changeType = "positive", stable = false,
}: {
  icon: React.ElementType; label: string; value: string | null;
  change: string; changeType?: "positive" | "negative"; stable?: boolean;
}) {
  const displayValue = value ?? "-";

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            stable
              ? "bg-muted text-muted-foreground"
              : changeType === "positive"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-500 dark:text-red-400"
          )}>{change}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{displayValue}</p>
      </CardContent>
    </Card>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
const revenueData = [
  { day: "MON", current: 42, prev: 30 }, { day: "TUE", current: 58, prev: 42 },
  { day: "WED", current: 50, prev: 38 }, { day: "THU", current: 75, prev: 55 },
  { day: "FRI", current: 88, prev: 65 }, { day: "SAT", current: 35, prev: 28 },
  { day: "SUN", current: 45, prev: 35 },
];

function RevenueChart() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Revenue Velocity</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Current Period
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-300 dark:bg-indigo-800" />
              Previous Period
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-end gap-2 h-44 mt-2">
          {revenueData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-36">
                <div className="flex-1 rounded-t-md bg-indigo-300 dark:bg-indigo-800" style={{ height: `${d.prev}%` }} />
                <div className="flex-1 rounded-t-md bg-indigo-600" style={{ height: `${d.current}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
const activities = [
  { icon: Mail, color: "text-blue-500 bg-blue-500/10", title: "Email sent to Sarah Jenkins", time: "2 minutes ago" },
  { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", title: "Lead qualified: CloudTech Inc.", time: "1 hour ago" },
  { icon: UserPlus, color: "text-violet-500 bg-violet-500/10", title: "New lead from LinkedIn", time: "3 hours ago" },
  { icon: Phone, color: "text-rose-500 bg-rose-500/10", title: "Missed call from Mike Ross", time: "5 hours ago" },
];

function RecentActivity() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Recent Activity</CardTitle>
          <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", a.color)}>
              <a.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium leading-snug">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Upcoming Tasks ───────────────────────────────────────────────────────────
const tasks = [
  { label: "Follow up with Globex", due: "Due Today, 4:00 PM", priority: "HIGH", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { label: "Prepare Q3 Proposal", due: "Due Tomorrow", priority: "MED", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { label: "Review Lead Scraper Logs", due: "Oct 24, 2023", priority: "LOW", color: "bg-muted text-muted-foreground border-border" },
];

function UpcomingTasks() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-semibold text-foreground">Upcoming Tasks</CardTitle>
          <Badge className="bg-rose-500 hover:bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
            3 Overdue
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <Checkbox className="rounded shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.due}</p>
            </div>
            <span className={cn("text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0", t.color)}>
              {t.priority}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── AI Sales Assistant ───────────────────────────────────────────────────────
function AISalesAssistant() {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-0 shadow-lg rounded-xl text-white h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <p className="text-[10px] font-semibold text-indigo-300 mb-2 uppercase tracking-widest">
          AI Sales Assistant
        </p>
        <p className="text-sm text-slate-300 leading-relaxed flex-1">
          Based on last week&apos;s data, you have a{" "}
          <span className="text-white font-semibold">82% chance</span> of closing the
          &lsquo;AeroDynamics&rsquo; deal if you follow up within the next 24 hours.
        </p>
        <Button className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg h-9">
          Take Action Now
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Props for the View ────────────────────────────────────────────────────────
interface AdminDashboardViewProps {
  username: string | null;
  leadcount: string | null;
}

// ─── View (pure UI, no state / no API calls) ──────────────────────────────────
// NO SidebarProvider / SidebarInset here — layout.tsx handles that
export default function AdminDashboardView({ username, leadcount }: AdminDashboardViewProps) {
  return (
    <>
      {/* ── Navbar (replaces the basic header in layout.tsx) ── */}
      <header className="sticky top-0 z-10 h-14 bg-background border-b border-border flex items-center px-4 gap-3 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search data..."
            className="w-full text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <Separator orientation="vertical" className="h-5 mx-2" />
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">{username}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Senior Account Executive</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AR
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Performance Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your team&apos;s real-time sales velocity and pipeline health.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />Last 30 Days
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
              <Download className="w-3.5 h-3.5" />Export Report
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Leads" value={leadcount} change="+12.5%" />
          <StatCard icon={TrendingUp} label="Conversion Rate" value="18.4%" change="+3.2%" />
          <StatCard icon={DollarSign} label="Avg. Deal Value" value="$12.4k" change="Stable" stable />
          <StatCard icon={BarChart3} label="Projected Revenue" value="$1.2M" change="+2.4%" />
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <div><RecentActivity /></div>
        </div>

        {/* Tasks + AI */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><UpcomingTasks /></div>
          <div><AISalesAssistant /></div>
        </div>
      </div>
    </>
  );
}