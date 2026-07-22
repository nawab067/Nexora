'use client';
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
    List,
    ChevronLeft,
    ChevronRight,
    Send,
    Mail,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    Circle,
    PhoneCall,
    BadgeCheck,
    XCircle,
    Trophy,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, HelpCircle, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    conversion: number;
    totalcount: number;
    totalWinrate: number;
    
}

// ─── Avatar colors ────────────────────────────────────────────────────────────
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
    size = "h-9 w-9",
}: {
    name: string;
    index: number;
    imageUrl?: string;
    size?: string;
}) {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return (
        <Avatar className={cn(size, "shrink-0 border border-border/60")}>
            {imageUrl && <AvatarImage src={imageUrl} alt={name} className="object-cover" />}
            <AvatarFallback className={cn(color.bg, color.text, "text-xs font-bold")}>
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
type StatusType = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";

const STATUS_CONFIG: Record<StatusType, { style: string; icon: React.ElementType }> = {
    NEW: { style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Circle },
    CONTACTED: { style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: PhoneCall },
    QUALIFIED: { style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: BadgeCheck },
    LOST: { style: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20", icon: XCircle },
    WON: { style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", icon: Trophy },
};

function StatusBadge({ status }: { status: string }) {
    const s = (status?.toUpperCase() ?? "NEW") as StatusType;
    const config = STATUS_CONFIG[s];
    const Icon = config?.icon ?? Circle;
    return (
        <Badge
            variant="outline"
            className={cn(
                "gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide",
                config?.style ?? "bg-muted text-muted-foreground border-border"
            )}
        >
            <Icon className="w-3 h-3" />
            {s}
        </Badge>
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
        <Card className="flex-1 min-w-0 shadow-sm border-border/70 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-muted-foreground font-medium leading-snug">{label}</p>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
                        <Icon className={cn("w-4.5 h-4.5", iconColor)} />
                    </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight mb-1">{value}</p>
                <p className={cn("text-xs font-medium", subColor)}>{sub}</p>
            </CardContent>
        </Card>
    );
}

// ─── Grid card (used when view mode = grid) ───────────────────────────────────
function LeadCard({
    customer,
    index,
    contactName,
    onEdit,
    onDelete,
    onAIEmail,
}: {
    customer: CustomerWithImage;
    index: number;
    contactName: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAIEmail: (customer: CustomerWithImage) => void;
}) {
    return (
        <Card className="border-border/70 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <LeadAvatar name={customer.name} index={index} imageUrl={customer.image_url} />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
                        <a
                            href={`mailto:${customer.email}`}
                            className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                        >
                            {customer.email}
                        </a>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={customer.status || ""} />
                    <span className="text-sm font-semibold text-foreground truncate max-w-[45%]">
                        {contactName}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-3">
                    {customer.leadsource || "—"}
                </p>
                <Separator className="mb-2" />
                <div className="flex items-center justify-end gap-1">
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                    onClick={() => onEdit(customer._id)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                    onClick={() => onDelete(customer._id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Delete</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                                    onClick={() => onAIEmail(customer)}
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">AI Email</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
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

                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
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

                    {!aiEmail.loading && aiEmail.error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-rose-600 dark:text-rose-400">{aiEmail.error}</p>
                        </div>
                    )}

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

                    {!aiEmail.loading && !aiEmail.sent && !aiEmail.error && (
                        <div className="space-y-4">
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
    conversion,
    totalcount,
    totalWinrate,
   

}: CustomerInfoViewProps): import("react").JSX.Element {
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
    const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());

    const uniqueStatuses = useMemo(
        () =>
            Array.from(
                new Set(filtered.map((c) => (c.status || "").toUpperCase()).filter(Boolean))
            ) as string[],
        [filtered]
    );

    const toggleStatus = (s: string) => {
        setStatusFilter((prev) => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
        });
    };

    const displayRows = useMemo(
        () =>
            statusFilter.size === 0
                ? paginated
                : paginated.filter(
                      (c) => c.status && statusFilter.has(c.status.toUpperCase())
                  ),
        [paginated, statusFilter]
    );

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
            <AIEmailDialog
                aiEmail={aiEmail}
                onClose={onCloseEmailDialog}
                onSend={onSendEmail}
                onSubjectChange={onEmailSubjectChange}
                onBodyChange={onEmailBodyChange}
            />

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-10 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border flex items-center px-4 gap-3 shrink-0">
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
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                        <Bell className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                        <HelpCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-5 mx-2" />
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                            AR
                        </AvatarFallback>
                    </Avatar>
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
                            className="h-9 text-sm gap-1.5 rounded-lg"
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
  
  

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                        label="Total Customer"
                        value={totalcount.toString()}
                        sub="Goal: $0 this quarter"
                        subColor="text-muted-foreground"
                        iconBg="bg-emerald-500/10"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Conversion Rate"
                        value={conversion.toString()}
                        sub="Nurture time: 14 days avg"
                        subColor="text-muted-foreground"
                        iconBg="bg-violet-500/10"
                        iconColor="text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        icon={BarChart2}
                        label="Win Rate"
                        value={totalWinrate.toString()}
                        sub="+5% vs Q3 baseline"
                        iconBg="bg-indigo-500/10"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                    />
                </div>

                {/* Toolbar */}
                <Card className="border-border/70 shadow-sm">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search leads…"
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-8 h-9 w-56 text-sm rounded-lg bg-muted border-border focus-visible:ring-1"
                                />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 rounded-lg relative",
                                            statusFilter.size > 0 &&
                                                "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        )}
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        {statusFilter.size > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-semibold">
                                                {statusFilter.size}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-56 p-2">
                                    <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                                        Filter by status
                                    </p>
                                    {uniqueStatuses.length === 0 && (
                                        <p className="text-xs text-muted-foreground px-2 py-1.5">
                                            No statuses yet
                                        </p>
                                    )}
                                    {uniqueStatuses.map((s) => (
                                        <label
                                            key={s}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
                                        >
                                            <Checkbox
                                                checked={statusFilter.has(s)}
                                                onCheckedChange={() => toggleStatus(s)}
                                            />
                                            {s}
                                        </label>
                                    ))}
                                    {statusFilter.size > 0 && (
                                        <button
                                            onClick={() => setStatusFilter(new Set())}
                                            className="w-full text-xs text-rose-500 hover:text-rose-600 px-2 py-1.5 text-left"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "grid")}>
                                <TabsList className="h-9">
                                    <TabsTrigger value="table" className="h-7 px-3 gap-1.5 text-xs">
                                        <List className="w-3.5 h-3.5" />
                                        Table
                                    </TabsTrigger>
                                    <TabsTrigger value="grid" className="h-7 px-3 gap-1.5 text-xs">
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        Grid
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {/* Table / Grid card */}
                <Card className="border-border/70 shadow-sm overflow-hidden p-0">
                    {viewMode === "table" ? (
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

                                {!loading && displayRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Users className="h-10 w-10 opacity-20" />
                                                <p className="text-sm font-semibold text-foreground">
                                                    No leads found
                                                </p>
                                                {(search || statusFilter.size > 0) && (
                                                    <p className="text-xs">Try a different search or filter</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    displayRows.map((customer, i) => {
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
                                                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
                    ) : (
                        <div className="p-4">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-40 rounded-xl" />
                                    ))}
                                </div>
                            ) : displayRows.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground py-16">
                                    <Users className="h-10 w-10 opacity-20" />
                                    <p className="text-sm font-semibold text-foreground">No leads found</p>
                                    {(search || statusFilter.size > 0) && (
                                        <p className="text-xs">Try a different search or filter</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {displayRows.map((customer, i) => (
                                        <LeadCard
                                            key={customer._id}
                                            customer={customer}
                                            index={(page - 1) * pageSize + i}
                                            contactName={
                                                customer.customerid
                                                    ? customerNames[customer.customerid] || "Loading..."
                                                    : "—"
                                            }
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onAIEmail={onAIEmail}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer / Pagination */}
                    <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/20">
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
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 rounded-lg"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 rounded-lg"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}