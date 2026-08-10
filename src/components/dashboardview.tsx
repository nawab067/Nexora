"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Bell,
  Settings,
  Search,
  ArrowUpRight,
  Target,
  RefreshCw,
  FileText,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────────────
   Types
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
interface SalesCards {
  conversionRate: { value: number; unit: string };
  averageDealValue: { value: number; unit: string };
  projectedRevenue: { value: number; unit: string };
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
  salesCards: SalesCards | null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Stat card — headline metric with icon badge + trend chip
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
  const isLoading = value === null;

  const ACCENTS: Record<string, { icon: string; bar: string }> = {
    indigo: { icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
    emerald: { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
    amber: { icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
    violet: { icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
  };
  const TrendIcon = changeType === "positive" ? ArrowUpRight : TrendingDown;

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          ACCENTS[accent].bar,
        )}
      />
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              ACCENTS[accent].icon,
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
              stable
                ? "bg-muted text-muted-foreground"
                : changeType === "positive"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            )}
          >
            {!stable && <TrendIcon className="h-3 w-3" />}
            {change}
          </span>
        </div>
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-[26px] font-semibold tracking-tight text-foreground tabular-nums",
            isLoading && "text-muted-foreground/40",
          )}
        >
          {displayValue}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Revenue chart — gradient area chart with legend toggles
───────────────────────────────────────────────────────────────────────── */
const revenueChartConfig = {
  this_week: { label: "This week", color: "#4f46e5" },
  last_week: { label: "Last week", color: "#a5b4fc" },
} satisfies ChartConfig;

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
  const hasData = !!revenueVelocity?.chart?.length;

  return (
    <Card className="h-full rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 px-5 pb-2 pt-5">
        <div>
          <CardTitle className="text-[15px] font-semibold text-foreground">
            Revenue velocity
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              ${weekTotal.toLocaleString()}
            </span>{" "}
            this week ·{" "}
            <span
              className={cn(
                "font-medium tabular-nums",
                delta < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>{" "}
            vs ${prevTotal.toLocaleString()} last week
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowThisWeek((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              showThisWeek
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "border-border text-muted-foreground",
            )}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
            This week
          </button>
          <button
            type="button"
            onClick={() => setShowLastWeek((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              showLastWeek
                ? "border-border bg-muted text-foreground/80"
                : "border-border text-muted-foreground",
            )}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-300 dark:bg-indigo-400/60" />
            Last week
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {hasData ? (
          <ChartContainer config={revenueChartConfig} className="h-56 w-full">
            <AreaChart
              data={revenueVelocity?.chart || []}
              margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="currentArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-this_week)" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="var(--color-this_week)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
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
                  dot={{ r: 3, fill: "var(--color-this_week)", stroke: "hsl(var(--card))", strokeWidth: 1.5 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
            <BarChart3 className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No revenue data yet this week</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Pipeline snapshot — stage bars
───────────────────────────────────────────────────────────────────────── */
const STAGE_COLORS: Record<string, string> = {
  New: "bg-indigo-600",
  Contacted: "bg-violet-500",
  Qualified: "bg-blue-500",
  Won: "bg-emerald-500",
};
const FALLBACK_COLORS = ["bg-indigo-600", "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
function getStageColor(label: string, index: number) {
  return STAGE_COLORS[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function PipelineSnapshot({
  leadPipelineData,
}: {
  leadPipelineData: LeadPipeline[] | null;
}) {
  const hasData = !!leadPipelineData?.length;

  return (
    <Card className="h-full rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-5 pb-2 pt-5">
        <CardTitle className="text-[15px] font-semibold text-foreground">
          Lead snapshot
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {hasData ? (
          <div className="space-y-3.5">
            {leadPipelineData!.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-[68px] shrink-0 text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      getStageColor(item.label, index),
                    )}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">No pipeline data yet</p>
        )}

        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Win rate this quarter</p>
          <Badge
            variant="secondary"
            className="rounded-full bg-emerald-500/10 font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            18.4%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────── */
export default function AdminDashboardView({
  useremail,
  username,
  leadcount,
  revenueVelocity,
  leadPipelineData,
  salesCards,
}: AdminDashboardViewProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const router = useRouter();
  const [userid, setUserid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${baseurl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
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
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />

        <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors focus-within:border-border focus-within:bg-muted hover:bg-muted">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search data..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => router.push("/admin/Reminders")}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-4 w-4" />
          </button>

          <Separator orientation="vertical" className="mx-2 h-5" />

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-semibold text-foreground">{username}</p>
              <p className="text-[10px] text-muted-foreground">Senior Account Executive</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-background">
              {useremail ? useremail.slice(0, 2).toUpperCase() : "AR"}
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-[calc(100vh-3.5rem)] space-y-6 bg-muted/30 p-6">
        {/* Heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
              Welcome back, {username} 👋
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {today} — here&apos;s how your pipeline is tracking.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            id="report"
            onClick={exportPDF}
            disabled={isExportingPDF}
            className="h-9 gap-1.5 text-xs font-medium shadow-sm disabled:opacity-70"
          >
            {isExportingPDF ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5" />
                Export report
              </>
            )}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={Users} label="Total leads" value={leadcount} change="+12.5%" accent="indigo" />
          <StatCard
            icon={TrendingUp}
            label="Conversion rate"
            value={salesCards ? `${salesCards.conversionRate.value}${salesCards.conversionRate.unit}` : null}
            change="+3.2%"
            accent="emerald"
          />
          <StatCard
            icon={DollarSign}
            label="Avg. deal value"
            value={salesCards ? `${salesCards.averageDealValue.value}${salesCards.averageDealValue.unit}` : null}
            change="Stable"
            stable
            accent="amber"
          />
          <StatCard
            icon={BarChart3}
            label="Projected revenue"
            value={salesCards ? `${salesCards.projectedRevenue.value}${salesCards.projectedRevenue.unit}` : null}
            change="+2.4%"
            accent="violet"
          />
        </div>

        {/* Chart + pipeline */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart revenueVelocity={revenueVelocity} />
          </div>
          <PipelineSnapshot leadPipelineData={leadPipelineData} />
        </div>
      </div>
    </>
  );
}