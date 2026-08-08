"use client";

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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
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
  RefreshCw,
  FileText,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Stat card — headline metric with inline trend + sparkline
───────────────────────────────────────────────────────────────────────── */
interface LeadPipeline {
  label: string;
  count: number;
  percentage: number;
}
interface RevenueChartItem {
  day: string;
  this_week: number;
  last_week: number;
}

interface RevenueVelocity {
  chart: RevenueChartItem[];
  growth_percentage: number;
  total_last_week: number;
  total_this_week: number;
}

interface AdminDashboardViewProps {
  useremail: string | null;
  leadcount: string | null;
  revenueVelocity: RevenueVelocity | null;
  leadPipelineData: LeadPipeline[] | null;
  username: string | null;
}
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
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              ACCENTS[accent],
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              stable
                ? "bg-muted text-muted-foreground"
                : changeType === "positive"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500 dark:text-rose-400",
            )}
          >
            {!stable && <TrendIcon className="w-3 h-3" />}
            {change}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {displayValue}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Revenue chart — smooth gradient area chart (recharts, matches Reports page)
───────────────────────────────────────────────────────────────────────── */

const revenueChartConfig = {
  this_week: {
    label: "This week",
    color: "#4f46e5",
  },
  last_week: {
    label: "Last week",
    color: "#c7d2fe",
  },
} satisfies ChartConfig;

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
// ...keep your existing imports, just add useState

function RevenueChart({
  revenueVelocity,
}: {
  revenueVelocity: RevenueVelocity | null;
}) {
  const [showLastWeek, setShowLastWeek] = useState(true);
  const [showThisWeek, setShowThisWeek] = useState(true);

  const weekTotal = revenueVelocity?.total_this_week ?? 0;
  const prevTotal = revenueVelocity?.total_last_week ?? 0;
  const delta = revenueVelocity?.growth_percentage ?? 0;

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Revenue Velocity
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              ${weekTotal.toLocaleString()} this week{" "}
              <span
                className={cn(
                  "font-medium",
                  delta < 0
                    ? "text-rose-500"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {delta > 0 ? "+" : ""}
                {delta}%
              </span>{" "}
              · ${prevTotal.toLocaleString()} last week
            </p>
          </div>

          {/* Legend as actual toggle buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowThisWeek((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors",
                showThisWeek
                  ? "border-indigo-600/30 text-foreground bg-indigo-500/5"
                  : "border-border text-muted-foreground opacity-50",
              )}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600" />
              This week
            </button>
            <button
              type="button"
              onClick={() => setShowLastWeek((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors",
                showLastWeek
                  ? "border-indigo-200 text-foreground bg-indigo-500/5"
                  : "border-border text-muted-foreground opacity-50",
              )}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-200 dark:bg-indigo-900" />
              Last week
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ChartContainer config={revenueChartConfig} className="h-52 w-full">
          <AreaChart
            data={revenueVelocity?.chart || []}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="currentArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-this_week)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-this_week)"
                  stopOpacity={0}
                />
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
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              content={<ChartTooltipContent />}
            />
            {showLastWeek && (
              <Area
                dataKey="last_week"
                type="monotone"
                fill="none"
                stroke="var(--color-last_week)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            {showThisWeek && (
              <Area
                dataKey="this_week"
                type="monotone"
                fill="url(#currentArea)"
                stroke="var(--color-this_week)"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "var(--color-this_week)",
                  stroke: "white",
                  strokeWidth: 1.5,
                }}
                activeDot={{ r: 5 }}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
const STAGE_COLORS: Record<string, string> = {
  New: "bg-indigo-600",
  Contacted: "bg-violet-500",
  Qualified: "bg-blue-500",
  Won: "bg-emerald-500",
};

const FALLBACK_COLORS = [
  "bg-indigo-600",
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
];

function getStageColor(label: string, index: number) {
  return STAGE_COLORS[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function PipelineSnapshot({
  leadPipelineData,
}: {
  leadPipelineData: LeadPipeline[] | null;
}) {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Lead Snapshot
          </CardTitle>
          <Target className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {leadPipelineData?.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-md flex items-center justify-end px-2 transition-all",
                  getStageColor(item.label, index),
                )}
                style={{ width: `${item.percentage}%` }}
              >
                <span className="text-[10px] font-semibold text-white">
                  {item.count}
                </span>
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
export default function AdminDashboardView({
  useremail,
  username,
  leadcount,
  revenueVelocity,
  leadPipelineData,
}: AdminDashboardViewProps) {
  const firstName = useremail?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
        setUserid(res.data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);
  const exportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const response = await axios.get(`${baseurl}/generate-report/${userid}`);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };
  return (
    <>
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
              <p className="text-xs font-semibold text-foreground leading-tight">
                {username}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Senior Account Executive
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {useremail ? useremail.slice(0, 2).toUpperCase() : "AR"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome back, {username} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today} — here&apos;s how your pipeline is tracking.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              id="report"
              onClick={exportPDF}
              disabled={isExportingPDF}
              className="h-8 text-xs gap-1.5 border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-70 transition-colors flex-1 sm:flex-none"
            >
              {isExportingPDF ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={leadcount}
            change="+12.5%"
            accent="indigo"
          />
          <StatCard
            icon={TrendingUp}
            label="Conversion Rate"
            value="18.4%"
            change="+3.2%"
            accent="emerald"
          />
          <StatCard
            icon={DollarSign}
            label="Avg. Deal Value"
            value="$12.4k"
            change="Stable"
            stable
            accent="amber"
          />
          <StatCard
            icon={BarChart3}
            label="Projected Revenue"
            value="$1.2M"
            change="+2.4%"
            accent="violet"
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueChart revenueVelocity={revenueVelocity} />
          </div>
          <div>
            <PipelineSnapshot leadPipelineData={leadPipelineData} />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4"></div>
      </div>
    </>
  );
}
