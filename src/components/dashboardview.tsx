'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Download,
  Calendar,
  Mail,
  Phone,
  UserPlus,
  CheckCircle2,
  Bell,
  HelpCircle,
  Settings,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Target,
  Flame,
  Clock,
  MessageSquare,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Stat card — headline metric with inline trend + sparkline
───────────────────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = "positive",
  stable = false,
  accent = "indigo",
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  change: string;
  changeType?: "positive" | "negative";
  stable?: boolean;
  accent?: "indigo" | "emerald" | "amber" | "violet";
}) {
  const displayValue = value ?? "—";
  const ACCENTS: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };
  const TrendIcon = changeType === "positive" ? ArrowUpRight : TrendingDown;

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden relative">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", ACCENTS[accent])}>
            <Icon className="w-5 h-5" />
          </div>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              stable
                ? "bg-muted text-muted-foreground"
                : changeType === "positive"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
            )}
          >
            {!stable && <TrendIcon className="w-3 h-3" />}
            {change}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{displayValue}</p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Revenue chart — smooth gradient area chart (recharts, matches Reports page)
───────────────────────────────────────────────────────────────────────── */

const revenueData = [
  { day: "Mon", current: 4200, prev: 3000 },
  { day: "Tue", current: 5800, prev: 4200 },
  { day: "Wed", current: 5000, prev: 3800 },
  { day: "Thu", current: 7500, prev: 5500 },
  { day: "Fri", current: 8800, prev: 6500 },
  { day: "Sat", current: 3500, prev: 2800 },
  { day: "Sun", current: 4500, prev: 3500 },
];

const revenueChartConfig = {
  current: { label: "This week", color: "#4f46e5" },
  prev: { label: "Last week", color: "#c7d2fe" },
} satisfies ChartConfig;

function RevenueChart() {
  const weekTotal = revenueData.reduce((sum, d) => sum + d.current, 0);
  const prevTotal = revenueData.reduce((sum, d) => sum + d.prev, 0);
  const delta = (((weekTotal - prevTotal) / prevTotal) * 100).toFixed(1);

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Revenue Velocity</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              ${weekTotal.toLocaleString()} this week{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{delta}%</span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600" />
              This week
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-200 dark:bg-indigo-900" />
              Last week
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ChartContainer config={revenueChartConfig} className="h-52 w-full">
          <AreaChart data={revenueData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="currentArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-current)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-current)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide />
            <ChartTooltip cursor={{ stroke: "hsl(var(--border))" }} content={<ChartTooltipContent />} />
            <Area
              dataKey="prev"
              type="monotone"
              fill="none"
              stroke="var(--color-prev)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Area
              dataKey="current"
              type="monotone"
              fill="url(#currentArea)"
              stroke="var(--color-current)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-current)", stroke: "white", strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Pipeline snapshot — compact horizontal funnel
───────────────────────────────────────────────────────────────────────── */

const pipelineStages = [
  { label: "New", count: 128, percentage: 100, color: "bg-indigo-600" },
  { label: "Contacted", count: 86, percentage: 67, color: "bg-violet-500" },
  { label: "Qualified", count: 52, percentage: 41, color: "bg-blue-500" },
  { label: "Won", count: 24, percentage: 19, color: "bg-emerald-500" },
];

function PipelineSnapshot() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Pipeline Snapshot</CardTitle>
          <Target className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {pipelineStages.map((stage) => (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">{stage.label}</span>
            <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
              <div
                className={cn("h-full rounded-md flex items-center justify-end px-2 transition-all", stage.color)}
                style={{ width: `${stage.percentage}%` }}
              >
                <span className="text-[10px] font-semibold text-white">{stage.count}</span>
              </div>
            </div>
          </div>
        ))}
        <Separator className="!my-4" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Win rate this quarter</p>
          <p className="text-sm font-semibold text-foreground">18.4%</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Recent activity — timeline with connector line
───────────────────────────────────────────────────────────────────────── */

const activities = [
  { icon: Mail, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10", title: "Email sent to Sarah Jenkins", detail: "Follow-up on Q3 proposal", time: "2m ago" },
  { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", title: "Lead qualified", detail: "CloudTech Inc. moved to Qualified", time: "1h ago" },
  { icon: UserPlus, color: "text-violet-600 dark:text-violet-400 bg-violet-500/10", title: "New lead captured", detail: "Inbound from LinkedIn campaign", time: "3h ago" },
  { icon: Phone, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10", title: "Missed call", detail: "Mike Ross — callback requested", time: "5h ago" },
  { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10", title: "Reply received", detail: "Globex Corp replied to your email", time: "Yesterday" },
];

function RecentActivity() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Recent Activity</CardTitle>
          <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="relative space-y-5">
          <div className="absolute left-4 top-1 bottom-1 w-px bg-border" />
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3 relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-card", a.color)}>
                <a.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm text-foreground font-medium leading-snug truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.detail}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 pt-1.5 whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Upcoming tasks
───────────────────────────────────────────────────────────────────────── */

const tasks = [
  { label: "Follow up with Globex", due: "Due Today, 4:00 PM", priority: "HIGH", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { label: "Prepare Q3 Proposal", due: "Due Tomorrow", priority: "MED", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { label: "Review Lead Scraper Logs", due: "Fri, Jul 18", priority: "LOW", color: "bg-muted text-muted-foreground border-border" },
  { label: "Call AeroDynamics decision maker", due: "Mon, Jul 21", priority: "HIGH", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
];

function UpcomingTasks() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-semibold text-foreground">Upcoming Tasks</CardTitle>
          <Badge className="bg-rose-500 hover:bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
            2 Overdue
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
        <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          Add task
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Top leads — condensed watchlist
───────────────────────────────────────────────────────────────────────── */

const topLeads = [
  { name: "AeroDynamics Ltd.", contact: "Jordan Blake", score: 92 },
  { name: "CloudTech Inc.", contact: "Priya Nair", score: 84 },
  { name: "Globex Corp", contact: "Marcus Chen", score: 77 },
  { name: "Nimbus Systems", contact: "Ella Fischer", score: 65 },
];

function TopLeadsWidget() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Hottest Leads</CardTitle>
          <Flame className="w-4 h-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {topLeads.map((lead) => {
          const initials = lead.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
          return (
            <div key={lead.name} className="flex items-center gap-3">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-indigo-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.contact}</p>
              </div>
              <div className="flex items-center gap-2 w-20 shrink-0">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${lead.score}%` }} />
                </div>
                <span className="text-xs font-semibold text-foreground w-6 text-right">{lead.score}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AI Sales Assistant
───────────────────────────────────────────────────────────────────────── */

function AISalesAssistant() {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-0 shadow-lg rounded-xl text-white h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">
            Nexora AI Assistant
          </p>
          <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/15">
            <Sparkles className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed flex-1">
          Based on last week&apos;s activity, you have an{" "}
          <span className="text-white font-semibold">82% chance</span> of closing the
          &lsquo;AeroDynamics&rsquo; deal if you follow up within the next 24 hours.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Best send time: Tomorrow, 9:15 AM
        </div>
        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg h-9">
          Take Action Now
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Props for the View
───────────────────────────────────────────────────────────────────────── */

interface AdminDashboardViewProps {
  username: string | null;
  leadcount: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────
   View (pure UI, no state / no API calls)
───────────────────────────────────────────────────────────────────────── */

export default function AdminDashboardView({ username, leadcount }: AdminDashboardViewProps) {
  const firstName = username?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* ── Navbar ── */}
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
              {username ? username.slice(0, 2).toUpperCase() : "AR"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome back, {firstName} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today} — here&apos;s how your pipeline is tracking.
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
          <StatCard icon={Users} label="Total Leads" value={leadcount} change="+12.5%" accent="indigo" />
          <StatCard icon={TrendingUp} label="Conversion Rate" value="18.4%" change="+3.2%" accent="emerald" />
          <StatCard icon={DollarSign} label="Avg. Deal Value" value="$12.4k" change="Stable" stable accent="amber" />
          <StatCard icon={BarChart3} label="Projected Revenue" value="$1.2M" change="+2.4%" accent="violet" />
        </div>

        {/* Revenue + pipeline snapshot */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <div><PipelineSnapshot /></div>
        </div>

        {/* Activity + tasks + AI assistant */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div><RecentActivity /></div>
          <div><UpcomingTasks /></div>
          <div><AISalesAssistant /></div>
        </div>

        {/* Top leads + quick goal progress */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><TopLeadsWidget /></div>
          <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Quarterly Goal</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Revenue target</span>
                  <span className="font-medium text-foreground">$1.2M / $1.5M</span>
                </div>
                <Progress value={80} className="h-2 [&>div]:bg-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">New leads target</span>
                  <span className="font-medium text-foreground">{leadcount ?? "0"} / 500</span>
                </div>
                <Progress value={62} className="h-2 [&>div]:bg-emerald-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Deals closed</span>
                  <span className="font-medium text-foreground">24 / 40</span>
                </div>
                <Progress value={60} className="h-2 [&>div]:bg-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}