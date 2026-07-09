'use client';
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    Trash2,
    Pencil,
    Sparkles,
    Search,
    Users,
    TrendingUp,
    DollarSign,
    BarChart2,
    Download,
    SlidersHorizontal,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    Send,
    Mail,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, HelpCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import type { AIEmailDialogState } from "@/app/admin/Lead/page"; // adjust path as needed

interface CustomerWithImage {
    _id: string;
    name: string;
    email?: string;
    image_url?: string;
    customerid?: string;
    customername?: string;
    leadsource?: string;
    status?: string;
}

import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CustomerInfoViewProps {
    customerData: CustomerWithImage[];
    loading: boolean;
    filtered: CustomerWithImage[];
    paginated: CustomerWithImage[];

    search: string;
    onSearchChange: (value: string) => void;
    activeTab: "all" | "my" | "team";
    onTabChange: (tab: "all" | "my" | "team") => void;

    page: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;

    selectedIds: Set<string>;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleOne: (id: string) => void;

    onAddCustomer: () => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onAIEmail: (customer: CustomerWithImage) => void;

    // ── AI Email Dialog ──
    aiEmail: AIEmailDialogState;
    onCloseEmailDialog: () => void;
    onSendEmail: () => void;
    onEmailSubjectChange: (value: string) => void;
    onEmailBodyChange: (value: string) => void;
}

// ─── Avatar colors ────────────────────────────────────────────────────────────
// Decorative identity colors — kept fixed across themes via /15 opacity tints
// rather than tied to background/foreground tokens.
const AVATAR_COLORS = [
    { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
    { bg: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400" },
    { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" },
    { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400" },
    { bg: "bg-sky-500/15", text: "text-sky-600 dark:text-sky-400" },
];

function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function LeadAvatar({
    name,
    index,
    imageUrl,
}: {
    name: string;
    index: number;
    imageUrl?: string;
}) {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    if (imageUrl) {
        return (
            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border">
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            </div>
        );
    }
    return (
        <div
            className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                color.bg,
                color.text
            )}
        >
            {getInitials(name)}
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
type StatusType = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";

const STATUS_STYLES: Record<StatusType, string> = {
    NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    CONTACTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    QUALIFIED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    LOST: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
    WON: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

function StatusBadge({ status }: { status: string }) {
    const s = (status?.toUpperCase() ?? "NEW") as StatusType;
    const style =
        STATUS_STYLES[s] ?? "bg-muted text-muted-foreground border-border";
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
                style
            )}
        >
            {s}
        </span>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    subColor = "text-emerald-600 dark:text-emerald-400",
    iconBg = "bg-indigo-500/10",
    iconColor = "text-indigo-600 dark:text-indigo-400",
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub: string;
    subColor?: string;
    iconBg?: string;
    iconColor?: string;
}) {
    return (
        <div className="flex-1 min-w-0 bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium leading-snug">{label}</p>
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight mb-1">{value}</p>
            <p className={cn("text-xs font-medium", subColor)}>{sub}</p>
        </div>
    );
}

// ─── AI Email Dialog ──────────────────────────────────────────────────────────
function AIEmailDialog({
    aiEmail,
    onClose,
    onSend,
    onSubjectChange,
    onBodyChange,
}: {
    aiEmail: AIEmailDialogState;
    onClose: () => void;
    onSend: () => void;
    onSubjectChange: (v: string) => void;
    onBodyChange: (v: string) => void;
}) {
    return (
        <Dialog open={aiEmail.open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl gap-0">
                {/* ── Header ── */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                                AI-Generated Email
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Review and edit before sending to{" "}
                                <span className="font-medium text-foreground">
                                    {aiEmail.recipientName}
                                </span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Loading state */}
                    {aiEmail.loading && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Generating personalised email…
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-full rounded-lg" />
                                <Skeleton className="h-4 w-1/3 rounded" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-5/6 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-4/5 rounded" />
                                <Skeleton className="h-4 w-3/4 rounded" />
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {!aiEmail.loading && aiEmail.error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-rose-600 dark:text-rose-400">{aiEmail.error}</p>
                        </div>
                    )}

                    {/* Success / sent state */}
                    {!aiEmail.loading && aiEmail.sent && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Email sent!</p>
                            <p className="text-xs text-muted-foreground text-center max-w-xs">
                                Your email has been delivered to{" "}
                                <span className="font-medium text-foreground">
                                    {aiEmail.recipientEmail}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Email preview / edit */}
                    {!aiEmail.loading && !aiEmail.sent && !aiEmail.error && (
                        <div className="space-y-4">
                            {/* To field */}
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted border border-border">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide shrink-0">
                                        To
                                    </span>
                                    <span className="text-sm text-foreground truncate">
                                        {aiEmail.recipientName}{" "}
                                        <span className="text-muted-foreground">
                                            &lt;{aiEmail.recipientEmail}&gt;
                                        </span>
                                    </span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] px-2 py-0 h-5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shrink-0"
                                >
                                    AI drafted
                                </Badge>
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Subject
                                </label>
                                <Input
                                    value={aiEmail.subject}
                                    onChange={(e) => onSubjectChange(e.target.value)}
                                    className="h-9 text-sm border-border rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-400"
                                    placeholder="Email subject…"
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Message
                                </label>
                                <Textarea
                                    value={aiEmail.body}
                                    onChange={(e) => onBodyChange(e.target.value)}
                                    rows={10}
                                    className="text-sm border-border rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-indigo-400 leading-relaxed"
                                    placeholder="Email body…"
                                />
                            </div>

                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                Generated by AI — review carefully before sending.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                {!aiEmail.loading && (
                    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/40 flex-row items-center justify-between sm:justify-between gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground rounded-lg h-9"
                        >
                            {aiEmail.sent ? "Close" : "Cancel"}
                        </Button>

                        {!aiEmail.sent && !aiEmail.error && (
                            <Button
                                size="sm"
                                onClick={onSend}
                                disabled={
                                    aiEmail.sending ||
                                    !aiEmail.subject.trim() ||
                                    !aiEmail.body.trim()
                                }
                                className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 text-sm font-medium"
                            >
                                {aiEmail.sending ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        )}

                        {aiEmail.error && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClose}
                                className="h-9 gap-2 rounded-lg px-5 text-sm border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                            >
                                <X className="w-3.5 h-3.5" />
                                Dismiss
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Main view component ──────────────────────────────────────────────────────
export default function CustomerInfoView({
    customerData,
    loading,
    filtered,
    paginated,
    search,
    onSearchChange,
    activeTab,
    onTabChange,
    page,
    totalPages,
    pageSize,
    onPageChange,
    selectedIds,
    allSelected,
    onToggleAll,
    onToggleOne,
    onAddCustomer,
    onDelete,
    onEdit,
    onAIEmail,
    aiEmail,
    onCloseEmailDialog,
    onSendEmail,
    onEmailSubjectChange,
    onEmailBodyChange,
}: CustomerInfoViewProps): import("react").JSX.Element {
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
    const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

    useEffect(() => {
        async function loadCustomerNames() {
            const names: Record<string, string> = {};
            await Promise.all(
                paginated.map(async (customer) => {
                    if (!customer.customerid) return;
                    try {
                        const response = await axios.get(
                            `${baseurl}/customer/${customer.customerid}`
                        );
                        names[customer.customerid] = response.data;
                    } catch (error) {
                        console.error(`Error fetching customer ${customer.customerid}`, error);
                    }
                })
            );
            setCustomerNames(names);
        }
        loadCustomerNames();
    }, [paginated]);

    const exportCSV = () => {
        const csvData = filtered.map((customer) => ({
            Name: customer.name,
            Email: customer.email,
            Status: customer.status,
            Contact: customer.customerid
                ? customerNames[customer.customerid] || ""
                : "",
            LeadSource: customer.leadsource,
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Leads.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* ── AI Email Dialog (rendered at root level, always available) ── */}
            <AIEmailDialog
                aiEmail={aiEmail}
                onClose={onCloseEmailDialog}
                onSend={onSendEmail}
                onSubjectChange={onEmailSubjectChange}
                onBodyChange={onEmailBodyChange}
            />

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-10 h-14 bg-background border-b border-border flex items-center px-4 gap-3 shrink-0">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Separator orientation="vertical" className="h-5" />
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Search across CRM..."
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

            {/* ── Page body ── */}
            <div className="p-6 space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
                {/* Page heading */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Leads Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Track, nurture, and convert your pipeline effectively.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportCSV}
                            className="h-9 text-sm gap-1.5 border-border text-muted-foreground rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAddCustomer}
                            className="h-9 text-sm gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Lead
                        </Button>
                    </div>
                </div>


                <div className="flex gap-4">
                    <StatCard
                        icon={Users}
                        label="Total Active Leads"
                        value={loading ? "—" : customerData.length.toLocaleString()}
                        sub="+12% from last month"
                        iconBg="bg-indigo-500/10"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Pipeline Value"
                        value="0"
                        sub="Goal: $0 this quarter"
                        subColor="text-muted-foreground"
                        iconBg="bg-emerald-500/10"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Conversion Rate"
                        value="0%"
                        sub="Nurture time: 14 days avg"
                        subColor="text-muted-foreground"
                        iconBg="bg-violet-500/10"
                        iconColor="text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        icon={BarChart2}
                        label="Win Rate"
                        value="0%"
                        sub="+5% vs Q3 baseline"
                        iconBg="bg-indigo-600"
                        iconColor="text-white"
                    />
                </div>


                <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center rounded-lg bg-muted p-0.5">
                            {(["all", "my", "team"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange(tab)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                                        activeTab === tab
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab === "all"
                                        ? "All Leads"
                                        : tab === "my"
                                            ? "My Leads"
                                            : "Team"}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-5 bg-border mx-2" />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors">
                            All Statuses
                            <span className="text-muted-foreground">▾</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors ml-1">
                            Date Range: Last 30 Days
                            <span className="text-muted-foreground">▾</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search leads…"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-8 h-8 w-52 text-sm rounded-lg bg-muted border-border focus-visible:ring-1"
                            />
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table card */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
                                <TableHead className="w-10 pl-4">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={onToggleAll}
                                        className="rounded"
                                    />
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                    Lead Name
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                                    Lead Source
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-5">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {/* Skeletons */}
                            {loading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-border">
                                        <TableCell className="pl-4">
                                            <Skeleton className="h-4 w-4 rounded" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-9 w-9 rounded-full" />
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-3.5 w-28" />
                                                    <Skeleton className="h-3 w-36" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-3.5 w-28" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-3.5 w-16" />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Skeleton className="h-3.5 w-24" />
                                        </TableCell>
                                        <TableCell className="pr-5">
                                            <Skeleton className="h-6 w-20 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {/* Empty state */}
                            {!loading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Users className="h-10 w-10 opacity-20" />
                                            <p className="text-sm font-semibold text-foreground">
                                                No leads found
                                            </p>
                                            {search && (
                                                <p className="text-xs">Try a different search term</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Rows */}
                            {!loading &&
                                paginated.map((customer, i) => {
                                    const globalIndex = (page - 1) * pageSize + i;
                                    const isSelected = selectedIds.has(customer._id);
                                    return (
                                        <TableRow
                                            key={customer._id}
                                            className={cn(
                                                "group border-b border-border transition-colors last:border-0",
                                                isSelected ? "bg-indigo-500/5" : "hover:bg-muted/40"
                                            )}
                                        >
                                            <TableCell className="pl-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => onToggleOne(customer._id)}
                                                    className="rounded"
                                                />
                                            </TableCell>

                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <LeadAvatar
                                                        name={customer.name}
                                                        index={globalIndex}
                                                        imageUrl={customer.image_url}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground leading-tight">
                                                            {customer.name}
                                                        </p>
                                                        <a
                                                            href={`mailto:${customer.email}`}
                                                            className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                        >
                                                            {customer.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge status={customer.status || ""} />
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {customer.customerid
                                                        ? customerNames[customer.customerid] || "Loading..."
                                                        : "—"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-sm text-muted-foreground">
                                                    {customer.leadsource || "—"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="pr-5">
                                                <TooltipProvider delayDuration={100}>
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                                                                    onClick={() => onEdit(customer._id)}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">Edit</TooltipContent>
                                                        </Tooltip>

                                                        <AlertDialog>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Delete</TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently remove{" "}
                                                                        <span className="font-semibold text-foreground">
                                                                            {customer.name}
                                                                        </span>{" "}
                                                                        and cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive hover:bg-destructive/90"
                                                                        onClick={() => onDelete(customer._id)}
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-500/10"
                                                                    onClick={() => onAIEmail(customer)}
                                                                >
                                                                    <Sparkles className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">AI Email</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>

                    {/* Footer / Pagination */}
                    <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-card">
                        <p className="text-sm text-muted-foreground">
                            Showing{" "}
                            {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                            {Math.min(page * pageSize, filtered.length)} of{" "}
                            <span className="font-semibold text-foreground">
                                {filtered.length}
                            </span>{" "}
                            leads
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}