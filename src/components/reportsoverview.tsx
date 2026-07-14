'use client';

import { Badge } from "@/components/ui/badge";
import {  BarChart, Bar,  YAxis,  } from "recharts";
import { Button } from "@/components/ui/button";
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


interface EmailAnalytics {
  label: string;
  sent: number;
  replies: number;
  ignored: number;
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

interface ReportsPageProps {
  countleads: number;
  countcustomer: number;
  totalemailsent: number;
  totalreplies: number;
  monthlyleads: MonthlyLead[];
  emailanalytics: EmailAnalytics[];
  leadsdata: LeadData[];
}




const pipelineStages = [
  { label: "New", value: 1284, pct: 100, color: "bg-indigo-600" },
  { label: "Contacted", value: 940, pct: 73, color: "bg-indigo-500" },
  { label: "Interested", value: 610, pct: 47, color: "bg-violet-500" },
  { label: "Customer", value: 312, pct: 24, color: "bg-emerald-500" },
  { label: "Closed", value: 198, pct: 15, color: "bg-emerald-600" },
];



const replySentiment = [
  { label: "Positive", value: 58, color: "#4f46e5" },
  { label: "Neutral", value: 30, color: "#f59e0b" },
  { label: "Negative", value: 12, color: "#f43f5e" },
];

const leadSource = [
  { label: "LinkedIn", value: 38, color: "#4f46e5", icon: Users },
  { label: "Facebook", value: 22, color: "#0ea5e9", icon: Users },
  { label: "Website", value: 28, color: "#10b981", icon: Globe },
  { label: "Referral", value: 12, color: "#f59e0b", icon: Share2 },
];



const activityTimeline = [
  { icon: Mail, color: "text-blue-500 bg-blue-500/10", title: "Weekly report generated", time: "Today, 9:00 AM" },
  { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", title: "12 leads moved to Qualified", time: "Yesterday, 4:15 PM" },
  { icon: UserPlus, color: "text-violet-500 bg-violet-500/10", title: "28 new leads imported", time: "Yesterday, 11:02 AM" },
  { icon: Phone, color: "text-rose-500 bg-rose-500/10", title: "6 follow-up calls logged", time: "2 days ago" },
  { icon: Sparkles, color: "text-indigo-500 bg-indigo-500/10", title: "AI email campaign completed", time: "3 days ago" },
];

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

/* ─────────────────────────────────────────────────────────────────────────
   Pipeline — funnel chart
───────────────────────────────────────────────────────────────────────── */

function PipelineFunnel() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base font-semibold text-foreground">Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {pipelineStages.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">{s.label}</span>
            <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
              <div
                className={cn("h-full rounded-md flex items-center justify-end px-2 transition-all", s.color)}
                style={{ width: `${s.pct}%` }}
              >
                <span className="text-[10px] font-semibold text-white">{s.value.toLocaleString()}</span>
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

/* ─────────────────────────────────────────────────────────────────────────
   Top Performing Leads — table
───────────────────────────────────────────────────────────────────────── */

function TopPerformingLeads({
  leads,
}: {
  leads: LeadData[];
}) {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Lead Status
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-5">
                Lead Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Replies
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Score
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pr-5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {leads.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground py-10"
                >
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const initials = lead.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow
                    key={lead.customerid}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-white">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {lead.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {lead.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium text-foreground">
                      {lead.replies ?? 0}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {lead.score ?? 0}
                      </span>
                    </TableCell>

                    <TableCell className="pr-5">
                      <StatusBadge status={lead.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


function AIInsightsCard() {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-0 shadow-lg rounded-xl text-white h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <p className="text-[10px] font-semibold text-indigo-300 mb-2 uppercase tracking-widest flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5" /> AI Insights
        </p>
        <p className="text-sm text-slate-300 leading-relaxed flex-1">
          Your reply rate is <span className="text-white font-semibold">18% above</span> last
          month&apos;s average, driven mostly by leads sourced from LinkedIn.
        </p>
        <Button className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg h-9">
          View Full Analysis
        </Button>
      </CardContent>
    </Card>
  );
}

function AIRecommendationsCard() {
  const recommendations = [
    "Follow up with 6 stalled leads in the Contacted stage",
    "Re-engage leads from Facebook — reply rate dropped 9%",
    "Send a nurture sequence to leads idle for 14+ days",
  ];
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-base font-semibold text-foreground">AI Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
            </div>
            <p className="text-sm text-foreground leading-snug">{r}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LeadPredictionCard() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-base font-semibold text-foreground">Lead Prediction</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className="text-3xl font-bold text-foreground tracking-tight">142</p>
        <p className="text-xs text-muted-foreground mb-4">projected new leads next 30 days</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Model confidence</span>
            <span className="font-semibold text-foreground">87%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: "87%" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Recent Activity Timeline
───────────────────────────────────────────────────────────────────────── */

function ActivityTimeline() {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-base font-semibold text-foreground">Recent Activity Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="relative pl-4">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-5">
            {activityTimeline.map((a, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-card", a.color)}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm text-foreground font-medium leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



export default function ReportsPage({
  countleads,
  countcustomer,
  totalemailsent,
  totalreplies,
  monthlyleads,
  emailanalytics,
  leadsdata,
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
      <div className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Understand your sales performance with AI insights.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />Last 30 Days
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />Export PDF
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
              <FileSpreadsheet className="w-3.5 h-3.5" />Export Excel
            </Button>
          </div>
        </div>


        <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
          {overview.map((o) => (
            <OverviewCard key={o.label} {...o} />
          ))}
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><LeadAnalyticsChart  data={monthlyleads}/></div>
          <div><PipelineFunnel /></div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><EmailAnalyticsChart data={emailanalytics} /></div>
          <div>
            <PieChartCard title="Reply Sentiment" data={replySentiment} icon={MessageSquare} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div><PieChartCard title="Lead Source" data={leadSource} icon={Globe} /></div>
          <div className="xl:col-span-2"><TopPerformingLeads leads={leadsdata} /></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <AIInsightsCard />
          <AIRecommendationsCard />          <LeadPredictionCard />
        </div>

        <ActivityTimeline />
      </div>
    </>
  );
}