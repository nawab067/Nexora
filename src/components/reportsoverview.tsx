"use client";

import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import { Progress } from "@/components/ui/progress";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Users,
  UserCheck,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Target,
  Download,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Bot,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Calendar,
  Globe,
  Share2,
  Star,
  CheckCircle2,
  UserPlus,
  Phone,
  RefreshCw,
  DollarSign,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { useRouter } from "next/navigation";

export interface Analytics {
  label: string;
  count: number;
  percentage: number;
}
interface invoicechart {
  label: string;
  value: number;
  color: string;
}
interface EmailAnalytics {
  label: string;
  sent: number;
  replies: number;
  ignored: number;
}
interface RevenueAnalytics {
  month: string;
  revenue: number;
}

interface LeadAnalytics {
  label: string;
  value: number;
  count: number;
  color: string;
}

interface AIreply {
  label: string;
  value: number;
  color?: string;
}

interface LeadData {
  customerid: string;
  customer_name: string;
  name: string;
  status: string;
  replies?: number;
  score?: number;
}

interface MonthlyLead {
  month: string;
  leads: number;
}
interface AIPredictionType {
  predicted_leads: number;
  conversion_rate: string;
  confidence: string;
  prediction: string;
}

interface ReportsPageProps {
  countleads: number;
  countcustomer: number;
  totalemailsent: number;
  totalreplies: number;
  monthlyleads: MonthlyLead[];
  emailanalytics: EmailAnalytics[];
  leadsdata: LeadData[];
  leadanalytics: LeadAnalytics[];
  leadpipeline: Analytics[];
  AIReply: AIreply[];
  aiInsights: string;
  aiRecommendations: string[];
  aiprediction: AIPredictionType;
  conversionrate: number;
  averagescore: number;
  refreshing: boolean;
  onRefresh: () => void;
  revenueTrend: RevenueAnalytics[];
  invoiceStatus: invoicechart[];
  RevenueCount: number;
}

type StatusType = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";
const STATUS_STYLES: Record<StatusType, string> = {
  NEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
  QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOST: "bg-rose-50 text-rose-600 border-rose-200",
  WON: "bg-violet-50 text-violet-700 border-violet-200",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase() as StatusType;
  const style =
    STATUS_STYLES[s] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide whitespace-nowrap",
        style,
      )}
    >
      {s}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Overview stat card — matches the dashboard's StatCard: accent top bar,
   tinted icon chip, tabular-nums headline value.
───────────────────────────────────────────────────────────────────────── */

const ACCENTS: Record<
  string,
  { icon: string; bar: string }
> = {
  indigo: { icon: "bg-indigo-50 text-indigo-600", bar: "bg-indigo-500" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  amber: { icon: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  violet: { icon: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
  rose: { icon: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
  blue: { icon: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
};

function OverviewCard({
  icon: Icon,
  label,
  value,
  change,
  type,
  accent = "indigo",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change: string;
  type: "positive" | "negative";
  accent?: keyof typeof ACCENTS;
}) {
  const TrendIcon = type === "positive" ? ArrowUpRight : TrendingDown;
  return (
    <Card className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <span
        className={cn("absolute inset-x-0 top-0 h-0.5", ACCENTS[accent].bar)}
      />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3 sm:mb-5">
          <div
            className={cn(
              "flex h-9 w-9 sm:h-9 sm:w-9 items-center justify-center rounded-lg",
              ACCENTS[accent].icon,
            )}
          >
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />
          </div>
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap",
              type === "positive"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600",
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {change}
          </span>
        </div>
        <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 mb-1 truncate">
          {label}
        </p>
        <p className="text-xl sm:text-[26px] font-semibold text-slate-900 tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

const ALL_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function normalizeMonthlyLeads(data: { month: string; leads: number }[]) {
  const map = new Map(data.map((d) => [d.month, d.leads]));
  return ALL_MONTHS.map((month) => ({
    month,
    leads: map.get(month) ?? 0,
  }));
}

const leadChartConfig = {
  leads: {
    label: "Leads",
    color: "#4f46e5",
  },
} satisfies ChartConfig;

function LeadAnalyticsChart({
  data,
}: {
  data: {
    month: string;
    leads: number;
  }[];
}) {
  const chartData = normalizeMonthlyLeads(data ?? []);

  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Lead Analytics
        </CardTitle>
        <span className="text-xs text-slate-500 font-medium">
          Monthly Leads
        </span>
      </CardHeader>
      <CardContent className="px-2 sm:px-5 pb-4 sm:pb-5">
        <ChartContainer config={leadChartConfig} className="h-40 w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-leads)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-leads)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <ChartTooltip
              cursor={{ stroke: "#e2e8f0" }}
              content={<ChartTooltipContent />}
            />
            <Area
              dataKey="leads"
              type="monotone"
              fill="url(#leadArea)"
              stroke="var(--color-leads)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "var(--color-leads)",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const STATIC_TOTAL_REVENUE = "$89,400";

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981",
  },
} satisfies ChartConfig;

function normalizeMonthlyRevenue(data: { month: string; revenue: number }[]) {
  const map = new Map(data.map((d) => [d.month, d.revenue]));
  return ALL_MONTHS.map((month) => ({
    month,
    revenue: map.get(month) ?? 0,
  }));
}

function RevenueTrendChart({
  data,
}: {
  data: {
    month: string;
    revenue: number;
  }[];
}) {
  const chartData = normalizeMonthlyRevenue(data ?? []);
  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Revenue Trend
        </CardTitle>
        <span className="text-xs text-slate-500 font-medium">
          Monthly Revenue
        </span>
      </CardHeader>
      <CardContent className="px-2 sm:px-5 pb-4 sm:pb-5">
        <ChartContainer config={revenueChartConfig} className="h-40 w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <ChartTooltip
              cursor={{ stroke: "#e2e8f0" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#revenueArea)"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "var(--color-revenue)",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const stageColors: Record<string, string> = {
  New: "bg-indigo-600",
  Contacted: "bg-violet-500",
  Qualified: "bg-blue-500",
  Lost: "bg-rose-500",
  Won: "bg-emerald-500",
};

function PipelineFunnel({ data }: { data: Analytics[] }) {
  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Pipeline
        </CardTitle>
        <Target className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3.5">
        {data.map((stage) => (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 w-16 sm:w-20 shrink-0 truncate">
              {stage.label}
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  stageColors[stage.label] ?? "bg-slate-400",
                )}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
              {stage.count.toLocaleString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Email Analytics — grouped bar chart
───────────────────────────────────────────────────────────────────────── */

const emailChartConfig = {
  sent: { label: "Sent", color: "#4f46e5" },
  replies: { label: "Replies", color: "#10b981" },
  ignored: { label: "Ignored", color: "#cbd5e1" },
} satisfies ChartConfig;

function EmailAnalyticsChart({ data }: { data: EmailAnalytics[] }) {
  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Email Analytics
        </CardTitle>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Sent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Replies
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            Ignored
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-5 pb-4 sm:pb-5">
        <ChartContainer config={emailChartConfig} className="h-44 w-full">
          <BarChart
            data={data}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={24}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <ChartTooltip
              cursor={{ fill: "#f8fafc" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="sent"
              fill="var(--color-sent)"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
            <Bar
              dataKey="replies"
              fill="var(--color-replies)"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
            <Bar
              dataKey="ignored"
              fill="var(--color-ignored)"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
/* ─────────────────────────────────────────────────────────────────────────
   Pie chart (conic-gradient based — no extra dependency)
   Reused as-is for Invoice Status below (Paid / Pending / Overdue).
───────────────────────────────────────────────────────────────────────── */

function PieChartCard({
  title,
  data,
  icon: Icon,
}: {
  title: string;
  data: {
    label: string;
    value: number;
    color: string;
    icon?: React.ElementType;
  }[];
  icon: React.ElementType;
}) {
  let cumulative = 0;
  const gradientParts = data.map((d) => {
    const start = cumulative;
    cumulative += d.value;
    return `${d.color} ${start}% ${cumulative}%`;
  });

  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center space-y-0 gap-2 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <Icon className="w-4 h-4 text-indigo-600" />
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col xs:flex-row sm:flex-row items-center gap-4 sm:gap-5">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0"
          style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white" />
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-0 w-full">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-slate-500 flex-1 truncate">
                {d.label}
              </span>
              <span className="text-xs font-semibold text-slate-900 tabular-nums">
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformingLeads({ leads }: { leads: LeadData[] }) {
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const aReplies = a.replies ?? 0;
      const bReplies = b.replies ?? 0;
      if (aReplies > 0 && bReplies === 0) return -1;
      if (aReplies === 0 && bReplies > 0) return 1;

      return bReplies - aReplies;
    });
  }, [leads]);

  return (
    <Card className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 sm:px-6 pb-4 pt-5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <CardTitle className="text-[15px] font-semibold text-slate-900">
            Lead Status
          </CardTitle>
        </div>
        <Badge
          variant="secondary"
          className="font-medium text-xs shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-100"
        >
          {leads.length} {leads.length === 1 ? "lead" : "leads"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              No leads found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              New leads will appear here once added.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedLeads.map((lead) => {
              const initials = lead.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const hasReplies = (lead.replies ?? 0) > 0;
              const score = lead.score ?? 0;

              return (
                <div
                  key={lead.customerid}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Row 1 on mobile / left block on desktop: avatar, name, status */}
                  <div className="flex items-center gap-3 min-w-0 sm:flex-1">
                    <div className="relative shrink-0">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            hasReplies
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {hasReplies && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                        {lead.customer_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {lead.name}
                      </p>
                    </div>

                    {/* Status badge shows here on mobile only */}
                    <div className="shrink-0 sm:hidden">
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>

                  {/* Row 2 on mobile / right block on desktop: replies, score, status */}
                  <div className="flex items-center justify-between gap-3 pl-12 sm:pl-0 sm:justify-end sm:gap-6">
                    <div className="flex items-center gap-1.5 sm:w-16 sm:justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          hasReplies ? "text-slate-900" : "text-slate-400",
                        )}
                      >
                        {lead.replies ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-24">
                      <div className="h-1.5 flex-1 sm:w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-900 tabular-nums w-7 text-right shrink-0">
                        {score}
                      </span>
                    </div>

                    {/* Status badge shows here on desktop only */}
                    <div className="hidden sm:flex shrink-0 w-28 justify-end">
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AIInsightsCard({ aiInsights }: { aiInsights: string }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <Card className="h-full rounded-xl border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg">
      <CardContent className="p-4 sm:p-5 flex flex-col h-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <CardTitle className="text-[15px] font-semibold text-white">
              AI Insights
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/15">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>

        {!showFull && (
          <p className="text-sm text-slate-400 mt-3 line-clamp-2">
            {aiInsights}
          </p>
        )}

        {showFull && (
          <div className="mt-4 space-y-3 border-t border-slate-700/60 pt-4 flex-1">
            <p className="text-sm text-slate-300 leading-relaxed">
              {aiInsights}
            </p>
          </div>
        )}

        <Button
          onClick={() => setShowFull(!showFull)}
          variant="ghost"
          className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white gap-1.5"
        >
          {showFull ? "Hide Analysis" : "View Full Analysis"}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showFull ? "rotate-180" : ""
            }`}
          />
        </Button>
      </CardContent>
    </Card>
  );
}

function AIRecommendationsCard({
  recommendations,
}: {
  recommendations: string[];
}) {
  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center space-y-0 gap-2 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          AI Recommendations
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 sm:px-5 pb-4 sm:pb-5 space-y-1">
        {recommendations.map((recommendation, index) => (
          <div key={index}>
            <div className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-slate-50">
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-indigo-600">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm leading-snug text-slate-700">
                {recommendation}
              </p>
            </div>
            {index < recommendations.length - 1 && (
              <Separator className="bg-slate-100" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LeadPredictionCard({ prediction }: { prediction: AIPredictionType }) {
  // confidence comes in as a string like "82%" — Progress needs a number
  const confidenceValue = parseFloat(prediction.confidence);

  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex-row items-center space-y-0 gap-2 px-4 sm:px-5 pb-2 pt-4 sm:pt-5">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-emerald-600" />
        </div>
        <CardTitle className="text-[15px] font-semibold text-slate-900">
          Lead Prediction
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight tabular-nums">
            {prediction.predicted_leads}
          </p>
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-600 border-0 hover:bg-emerald-50"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            30d
          </Badge>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          projected new leads next 30 days
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Model confidence</span>
            <span className="font-medium text-slate-700">
              {prediction.confidence}
            </span>
          </div>

          <Progress
            value={confidenceValue}
            className="h-2 bg-slate-100 [&>div]:bg-emerald-500"
          />

          <p className="text-sm text-slate-500 mt-3 leading-snug">
            {prediction.prediction}
          </p>

          <p className="text-xs text-emerald-600 font-medium mt-2">
            Expected Conversion: {prediction.conversion_rate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
/* ─────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────── */
const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
export default function ReportsPage({
  countleads,
  countcustomer,
  totalemailsent,
  totalreplies,
  monthlyleads,
  emailanalytics,
  leadsdata,
  leadanalytics,
  leadpipeline,
  AIReply,
  aiInsights,
  aiRecommendations,
  aiprediction,
  conversionrate,
  averagescore,
  refreshing,
  revenueTrend,
  invoiceStatus,
  RevenueCount,
  onRefresh,
}: ReportsPageProps) {
  const [userid, setUserid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const router = useRouter();

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

  const handleshowUsername = async () => {
    try {
      const respoonse = await axios.get(`${baseurl}/admin/users/${userid}`);
      
    console.log("API Response:", respoonse.data);
    console.log("Type:", typeof respoonse.data);
      setUsername(respoonse.data);     
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if(!userid){
      return;
    }
    handleshowUsername();
  }, [userid])         
  const overview = [
    {
      icon: Users,
      label: "Total Leads",
      value: countleads.toString(),
      change: "+12.5%",
      type: "positive" as const,
      accent: "indigo" as const,
    },
    {
      icon: UserCheck,
      label: "Customers",
      value: countcustomer.toString(),
      change: "+8.1%",
      type: "positive" as const,
      accent: "violet" as const,
    },
    {
      icon: Mail,
      label: "Emails Sent",
      value: totalemailsent.toString(),
      change: "+3.4%",
      type: "positive" as const,
      accent: "blue" as const,
    },
    {
      icon: MessageSquare,
      label: "Replies",
      value: totalreplies.toString(),
      change: "-2.2%",
      type: "negative" as const,
      accent: "rose" as const,
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: conversionrate.toString(),
      change: "+1.8%",
      type: "positive" as const,
      accent: "emerald" as const,
    },
    {
      icon: Target,
      label: "Lead Score Avg",
      value: averagescore,
      change: "+4 pts",
      type: "positive" as const,
      accent: "amber" as const,
    },
    // ── Revenue overview card (new, static — design only) ──
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: RevenueCount.toString(),
      change: "+9.6%",
      type: "positive" as const,
      accent: "emerald" as const,
    },
  ];
  const replySentiment = useMemo(() => {
    const colors: Record<string, string> = {
      Positive: "#4f46e5",
      Neutral: "#f59e0b",
      Negative: "#f43f5e",
    };

    return AIReply.map((item) => ({
      ...item,
      color: colors[item.label] ?? "#94a3b8",
    }));
  }, [AIReply]);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
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

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Overview
    const overviewData = [
      { Metric: "Total Leads", Value: countleads },
      { Metric: "Customers", Value: countcustomer },
      { Metric: "Emails Sent", Value: totalemailsent },
      { Metric: "Replies", Value: totalreplies },
      { Metric: "Conversion Rate", Value: "18.4%" },
      { Metric: "Lead Score Avg", Value: 72 },
    ];

    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

    // Monthly Leads
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyleads);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Leads");

    // Email Analytics
    const emailSheet = XLSX.utils.json_to_sheet(emailanalytics);
    XLSX.utils.book_append_sheet(workbook, emailSheet, "Email Analytics");

    // Lead Pipeline
    const pipelineSheet = XLSX.utils.json_to_sheet(leadpipeline);
    XLSX.utils.book_append_sheet(workbook, pipelineSheet, "Pipeline");

    // Lead Source
    const sourceSheet = XLSX.utils.json_to_sheet(leadanalytics);
    XLSX.utils.book_append_sheet(workbook, sourceSheet, "Lead Sources");

    // AI Reply Sentiment
    const sentimentSheet = XLSX.utils.json_to_sheet(AIReply);
    XLSX.utils.book_append_sheet(workbook, sentimentSheet, "Reply Sentiment");

    // Lead Table
    const leadSheet = XLSX.utils.json_to_sheet(leadsdata);
    XLSX.utils.book_append_sheet(workbook, leadSheet, "Leads");

    // AI Recommendations
    const recommendationSheet = XLSX.utils.json_to_sheet(
      aiRecommendations.map((item, index) => ({
        No: index + 1,
        Recommendation: item,
      })),
    );

    XLSX.utils.book_append_sheet(
      workbook,
      recommendationSheet,
      "AI Recommendations",
    );

    // Prediction
    const predictionSheet = XLSX.utils.json_to_sheet([
      {
        PredictedLeads: aiprediction.predicted_leads,
        ConversionRate: aiprediction.conversion_rate,
        Confidence: aiprediction.confidence,
        Prediction: aiprediction.prediction,
      },
    ]);

    XLSX.utils.book_append_sheet(workbook, predictionSheet, "Prediction");

    // AI Insight
    const insightSheet = XLSX.utils.json_to_sheet([
      {
        Insight: aiInsights,
      },
    ]);

    XLSX.utils.book_append_sheet(workbook, insightSheet, "AI Insight");

    // Download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "CRM_Report.xlsx");
  };

  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-10 flex min-h-14 shrink-0 flex-wrap items-center gap-2 sm:gap-3 border-b border-slate-200 bg-white/80 px-2 py-2 backdrop-blur-sm sm:px-4 sm:py-0">
        <div className="flex items-center gap-2 shrink-0">
          <SidebarTrigger className="text-slate-400 hover:text-slate-900" />
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="h-8 shrink-0 gap-1.5 border-slate-200 bg-white text-xs font-medium text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-70 transition-colors"
        >
          <RefreshCw
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-500",
              refreshing && "animate-spin",
            )}
          />
          <span className="hidden xs:inline sm:inline">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </Button>

        <div className="hidden md:flex max-w-sm flex-1 min-w-[120px] items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors focus-within:border-slate-200 focus-within:bg-slate-50 hover:bg-slate-50">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => router.push("/admin/Reminders")}
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="w-4 h-4" />
          </button>
          <Separator
            orientation="vertical"
            className="h-5 mx-2 hidden sm:block"
          />
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white">
            {username ? username.slice(0, 2).toUpperCase() : "U"}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div
        ref={reportRef}
        className="min-h-[calc(100vh-3.5rem)] space-y-4 sm:space-y-6 bg-slate-50 p-3 sm:p-6"
      >
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Understand your sales performance with AI insights.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              id="report"
              onClick={exportPDF}
              disabled={isExportingPDF}
              className="h-9 flex-1 sm:flex-none gap-1.5 border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-70 transition-colors"
            >
              {isExportingPDF ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Export PDF
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={exportExcel}
              className="h-9 flex-1 sm:flex-none gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Overview cards — now 7 with Total Revenue included */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          {overview.map((o) => (
            <OverviewCard key={o.label} {...o} />
          ))}
        </div>

        {/* ── Revenue Analytics section ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="xl:col-span-2">
            <RevenueTrendChart data={revenueTrend} />
          </div>
          <div>
            <PieChartCard
              title="Invoice Status"
              icon={Receipt}
              data={invoiceStatus}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="xl:col-span-2">
            <LeadAnalyticsChart data={monthlyleads} />
          </div>
          <div>
            <PipelineFunnel data={leadpipeline} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="xl:col-span-2">
            <EmailAnalyticsChart data={emailanalytics} />
          </div>
          <div>
            <PieChartCard
              title="Reply Sentiment"
              data={replySentiment}
              icon={MessageSquare}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <PieChartCard
              title="Lead Source"
              icon={Globe}
              data={leadanalytics}
            />
          </div>
          <div className="xl:col-span-2">
            <TopPerformingLeads leads={leadsdata} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <AIInsightsCard aiInsights={aiInsights} />
          <AIRecommendationsCard recommendations={aiRecommendations} />
          <LeadPredictionCard prediction={aiprediction} />
        </div>
      </div>
    </>
  );
}