'use client';

import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, YAxis, } from "recharts";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown } from "lucide-react";
import { useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";



export interface Analytics {
  label: string;
  count: number;
  percentage: number;
}

interface EmailAnalytics {
  label: string;
  sent: number;
  replies: number;
  ignored: number;
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
}






type StatusType = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";
const STATUS_STYLES: Record<StatusType, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  CONTACTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  QUALIFIED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LOST: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
  WON: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase() as StatusType;
  const style = STATUS_STYLES[s] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide", style)}>
      {s}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Overview stat card
───────────────────────────────────────────────────────────────────────── */

function OverviewCard({
  icon: Icon, label, value, change, type,
}: {
  icon: React.ElementType; label: string; value: string; change: string; type: "positive" | "negative";
}) {
  const ArrowIcon = type === "positive" ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
            type === "positive"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
          )}>
            <ArrowIcon className="w-3 h-3" />
            {change}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}




const ALL_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Lead Analytics
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">Monthly Leads</span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ChartContainer config={leadChartConfig} className="h-40 w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-leads)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-leads)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="leads"
              type="monotone"
              fill="url(#leadArea)"
              stroke="var(--color-leads)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-leads)", stroke: "white", strokeWidth: 1.5 }}
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
  Lost: "bg-red-500",
  Won: "bg-green-500",
};

function PipelineFunnel({
  data,
}: {
  data: Analytics[];
}) {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base font-semibold text-foreground">Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {data.map((stage) => (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">{stage.label}</span>
            <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-md flex items-center justify-end px-2 transition-all",
                  stageColors[stage.label]
                )}
                style={{ width: `${stage.percentage}%` }}
              >
                <span className="text-[10px] font-semibold text-white">{stage.count.toLocaleString()}</span>
              </div>
            </div>
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
  ignored: { label: "Ignored", color: "#d1d5db" },
} satisfies ChartConfig;

function EmailAnalyticsChart({
  data,
}: {
  data: EmailAnalytics[];
}) {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Email Analytics
          </CardTitle>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Sent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Replies
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              Ignored
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <ChartContainer config={emailChartConfig} className="h-44 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={24}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="sent" fill="var(--color-sent)" radius={[3, 3, 0, 0]} barSize={10} />
            <Bar dataKey="replies" fill="var(--color-replies)" radius={[3, 3, 0, 0]} barSize={10} />
            <Bar dataKey="ignored" fill="var(--color-ignored)" radius={[3, 3, 0, 0]} barSize={10} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
/* ─────────────────────────────────────────────────────────────────────────
   Pie chart (conic-gradient based — no extra dependency)
───────────────────────────────────────────────────────────────────────── */

function PieChartCard({
  title, data, icon: Icon,
}: {
  title: string;
  data: { label: string; value: number; color: string; icon?: React.ElementType }[];
  icon: React.ElementType;
}) {
  let cumulative = 0;
  const gradientParts = data.map((d) => {
    const start = cumulative;
    cumulative += d.value;
    return `${d.color} ${start}% ${cumulative}%`;
  });

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 flex items-center gap-5">
        <div
          className="w-24 h-24 rounded-full shrink-0"
          style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-card" />
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-muted-foreground flex-1 truncate">{d.label}</span>
              <span className="text-xs font-semibold text-foreground">{d.value}%</span>
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
    <Card className="border-border/60 shadow-sm rounded-xl h-full overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Lead Status
            </CardTitle>
          </div>
          <Badge variant="secondary" className="font-medium text-xs">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No leads found</p>
            <p className="text-xs text-muted-foreground mt-1">
              New leads will appear here once added.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
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
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-semibold",
                          hasReplies
                            ? "bg-indigo-600 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {hasReplies && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">
                      {lead.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {lead.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 w-16 shrink-0 justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        hasReplies ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {lead.replies ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-24 shrink-0">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.min(score, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-7 text-right">
                      {score}
                    </span>
                  </div>

                  <div className="shrink-0 w-28 flex justify-end">
                    <StatusBadge status={lead.status} />
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

function AIInsightsCard({
  aiInsights,
}: {
  aiInsights: string;
}) {
  const [showFull, setShowFull] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-0 shadow-lg rounded-xl text-white h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <CardTitle className="text-base font-semibold text-white">
              AI Insights
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/15">
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
            className={`w-4 h-4 transition-transform duration-200 ${showFull ? "rotate-180" : ""
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
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-base font-semibold">
            AI Recommendations
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-1">
        {recommendations.map((recommendation, index) => (
          <div key={index}>
            <div className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-muted/60">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm leading-snug text-foreground/90">
                {recommendation}
              </p>
            </div>
            {index < recommendations.length - 1 && (
              <Separator className="opacity-50" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LeadPredictionCard({
  prediction,
}: {
  prediction: AIPredictionType;
}) {
  // confidence comes in as a string like "82%" — Progress needs a number
  const confidenceValue = parseFloat(prediction.confidence);

  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <CardTitle className="text-base font-semibold">
            Lead Prediction
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight">
            {prediction.predicted_leads}
          </p>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            30d
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          projected new leads next 30 days
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Model confidence</span>
            <span className="font-medium">{prediction.confidence}</span>
          </div>

          <Progress
            value={confidenceValue}
            className="h-2 [&>div]:bg-emerald-500"
          />

          <p className="text-sm text-muted-foreground mt-3 leading-snug">
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
   Recent Activity Timeline
───────────────────────────────────────────────────────────────────────── */





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
  aiprediction
}: ReportsPageProps) {
  const overview = [
    {
      icon: Users,
      label: "Total Leads",
      value: countleads.toString(),
      change: "+12.5%",
      type: "positive" as const,
    },
    {
      icon: UserCheck,
      label: "Customers",
      value: countcustomer.toString(),
      change: "+8.1%",
      type: "positive" as const,
    },
    {
      icon: Mail,
      label: "Emails Sent",
      value: totalemailsent.toString(),
      change: "+3.4%",
      type: "positive" as const,
    },
    {
      icon: MessageSquare,
      label: "Replies",
      value: totalreplies.toString(),
      change: "-2.2%",
      type: "negative" as const,
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: "18.4%",
      change: "+1.8%",
      type: "positive" as const,
    },
    {
      icon: Target,
      label: "Lead Score Avg",
      value: "72",
      change: "+4 pts",
      type: "positive" as const,
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
  const exportPDF = async () => {
    if (!reportRef.current) return;

    const dataUrl = await htmlToImage.toPng(reportRef.current);

    const pdf = new jsPDF("p", "mm", "a4");

    const width = pdf.internal.pageSize.getWidth();

    const img = new Image();

    img.src = dataUrl;

    img.onload = () => {
      const height = (img.height * width) / img.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

      pdf.save("CRM_Report.pdf");
    };
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
      }))
    );

    XLSX.utils.book_append_sheet(
      workbook,
      recommendationSheet,
      "AI Recommendations"
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
      <header className="sticky top-0 z-10 h-14 bg-background border-b border-border flex items-center px-4 gap-3 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search reports..."
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
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AR
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div
        ref={reportRef}
        className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]"
      >
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Understand your sales performance with AI insights.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">

            <Button variant="outline" size="sm" id="report" onClick={exportPDF} className="h-8 text-xs gap-1.5 border-border text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />Export PDF
            </Button>
            <Button
              size="sm"
              onClick={exportExcel}
              className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </div>


        <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
          {overview.map((o) => (
            <OverviewCard key={o.label} {...o} />
          ))}
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><LeadAnalyticsChart data={monthlyleads} /></div>
          <div><PipelineFunnel data={leadpipeline} /></div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><EmailAnalyticsChart data={emailanalytics} /></div>
          <div>
            <PieChartCard title="Reply Sentiment" data={replySentiment} icon={MessageSquare} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div><PieChartCard
            title="Lead Source"
            icon={Globe}
            data={leadanalytics}
          /></div>
          <div className="xl:col-span-2"><TopPerformingLeads leads={leadsdata} /></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <AIInsightsCard aiInsights={aiInsights} />
          <AIRecommendationsCard recommendations={aiRecommendations} />          <LeadPredictionCard prediction={aiprediction} />
        </div>
      </div>
    </>
  );
}