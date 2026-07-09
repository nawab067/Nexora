'use client';
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, HelpCircle, Settings } from "lucide-react";

// Local type for customer entries — matches actual API response shape
interface CustomerWithImage {
    _id: string;
    userid: string;
    name: string;
    email?: string;
    phonenum?: string;
    Designation?: string;
    address?: string;
    image_url?: string;
}
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CustomerInfoViewProps {
    // data
    customerData: CustomerWithImage[];
    loading: boolean;
    filtered: CustomerWithImage[];
    paginated: CustomerWithImage[];
    // search & filter
    search: string;
    onSearchChange: (value: string) => void;
    activeTab: "all" | "my" | "team";
    onTabChange: (tab: "all" | "my" | "team") => void;
    // pagination
    page: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    // selection
    selectedIds: Set<string>;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleOne: (id: string) => void;
    // actions
    onAddCustomer: () => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;

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

// Image is shown as the lead's "icon" — falls back to initials avatar if no image_url
function LeadAvatar({ name, index, imageUrl }: { name: string; index: number; imageUrl?: string }) {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    if (imageUrl) {
        return (
            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border">
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            </div>
        );
    }
    return (
        <div className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            color.bg, color.text
        )}>
            {getInitials(name)}
        </div>
    );
}

// ─── Designation badge (replaces the old status badge slot) ──────────────────
const DESIGNATION_COLORS = [
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
];

function hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function DesignationBadge({ designation }: { designation?: string }) {
    if (!designation) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }
    const style = DESIGNATION_COLORS[hashString(designation) % DESIGNATION_COLORS.length];
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
            style
        )}>
            {designation.toUpperCase()}
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

}: CustomerInfoViewProps) {
    const exportCSV = () => {
        const csvData = filtered.map((customer) => ({
            Name: customer.name,
            Email: customer.email,
            Address: customer.address,
            Designation: customer.Designation,
            Phone: customer.phonenum
        }));

        const csv = Papa.unparse(csvData);

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "customer.csv";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
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
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Contact Managment</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Track, nurture, and convert your pipeline effectively.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            onClick={exportCSV}
                            variant="outline" size="sm"
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
                            Add New customer
                        </Button>
                    </div>
                </div>

                {/* Stat cards */}
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
                        value="$ 0"
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

                {/* Filter bar */}
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
                                    {tab === "all" ? "All Leads" : tab === "my" ? "My Leads" : "Team"}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-5 bg-border mx-2" />

                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors">
                            All Designations
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
                                    Address
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Designation
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-5">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {/* Skeletons */}
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-b border-border">
                                    <TableCell className="pl-4"><Skeleton className="h-4 w-4 rounded" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-3.5 w-28" />
                                                <Skeleton className="h-3 w-36" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                                    <TableCell className="pr-5"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))}

                            {/* Empty state */}
                            {!loading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Users className="h-10 w-10 opacity-20" />
                                            <p className="text-sm font-semibold text-foreground">No leads found</p>
                                            {search && <p className="text-xs">Try a different search term</p>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Rows */}
                            {!loading && paginated.map((customer, i) => {
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
                                        {/* Checkbox */}
                                        <TableCell className="pl-4">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggleOne(customer._id)}
                                                className="rounded"
                                            />
                                        </TableCell>

                                        {/* Lead Name + email (image shown as the icon) */}
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

                                        {/* Address */}
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
                                                {customer.address || "—"}
                                            </span>
                                        </TableCell>

                                        {/* Designation */}
                                        <TableCell>
                                            <DesignationBadge designation={customer.Designation} />
                                        </TableCell>

                                        {/* Phone number */}
                                        <TableCell>
                                            <span className="text-sm font-semibold text-foreground">
                                                {customer.phonenum || "—"}
                                            </span>
                                        </TableCell>

                                        {/* Actions */}
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
                                                                    <span className="font-semibold text-foreground">{customer.name}</span>{" "}
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
                            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                            {Math.min(page * pageSize, filtered.length)} of{" "}
                            <span className="font-semibold text-foreground">{filtered.length}</span> leads
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