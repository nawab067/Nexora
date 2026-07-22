"use client";
import Papa from "papaparse";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Pencil,
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
  Bell,
  HelpCircle,
  Settings,
  RefreshCw,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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

interface DashboardProps {
  customers: number;
  leads: number;
  pipeline_value: number;
  conversion_rate: number;
  win_rate: number;
}

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
  dashboardreview: DashboardProps;
  
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

// ─── Designation badge ────────────────────────────────────────────────────────
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
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide",
        style
      )}
    >
      {designation.toUpperCase()}
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
function CustomerCard({
  customer,
  index,
  onEdit,
  onDelete,
}: {
  customer: CustomerWithImage;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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
          <DesignationBadge designation={customer.Designation} />
          <span className="text-sm font-semibold text-foreground truncate max-w-[45%]">
            {customer.phonenum || "—"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mb-3">
          {customer.address || "—"}
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
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
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
  dashboardreview,
  
}: CustomerInfoViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [designationFilter, setDesignationFilter] = useState<Set<string>>(new Set());

  const uniqueDesignations = useMemo(
    () => Array.from(new Set(filtered.map((c) => c.Designation).filter(Boolean))) as string[],
    [filtered]
  );

  const toggleDesignation = (d: string) => {
    setDesignationFilter((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const displayRows = useMemo(
    () =>
      designationFilter.size === 0
        ? paginated
        : paginated.filter((c) => c.Designation && designationFilter.has(c.Designation)),
    [paginated, designationFilter]
  );

  const exportCSV = () => {
    const csvData = filtered.map((customer) => ({
      Name: customer.name,
      Email: customer.email,
      Address: customer.address,
      Designation: customer.Designation,
      Phone: customer.phonenum,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
              Contact Management
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
              Add New Customer
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Active Customers"
            value={loading ? "—" : dashboardreview.customers.toLocaleString()}
            sub="+12% from last month"
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={DollarSign}
            label="Total Leads"
            value={loading ? "—" : dashboardreview.leads.toLocaleString()}
            sub="Goal: $0 this quarter"
            subColor="text-muted-foreground"
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Conversion Rate"
            value={loading ? "—" : `${dashboardreview.conversion_rate}%`}
            sub="Nurture time: 14 days avg"
            subColor="text-muted-foreground"
            iconBg="bg-violet-500/10"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            icon={BarChart2}
            label="Win Rate"
            value={loading ? "—" : `${dashboardreview.win_rate}`}
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
                      designationFilter.size > 0 &&
                        "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {designationFilter.size > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-semibold">
                        {designationFilter.size}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2">
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                    Filter by designation
                  </p>
                  {uniqueDesignations.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1.5">
                      No designations yet
                    </p>
                  )}
                  {uniqueDesignations.map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={designationFilter.has(d)}
                        onCheckedChange={() => toggleDesignation(d)}
                      />
                      {d}
                    </label>
                  ))}
                  {designationFilter.size > 0 && (
                    <button
                      onClick={() => setDesignationFilter(new Set())}
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
                    <Checkbox checked={allSelected} onCheckedChange={onToggleAll} className="rounded" />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                    Customer Name
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
                        <p className="text-sm font-semibold text-foreground">No customer found</p>
                        {(search || designationFilter.size > 0) && (
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
                            <LeadAvatar name={customer.name} index={globalIndex} imageUrl={customer.image_url} />
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
                          <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
                            {customer.address || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <DesignationBadge designation={customer.Designation} />
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-semibold text-foreground">
                            {customer.phonenum || "—"}
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
                                    <AlertDialogTitle>Delete customer?</AlertDialogTitle>
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
                  <p className="text-sm font-semibold text-foreground">No customer found</p>
                  {(search || designationFilter.size > 0) && (
                    <p className="text-xs">Try a different search or filter</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayRows.map((customer, i) => (
                    <CustomerCard
                      key={customer._id}
                      customer={customer}
                      index={(page - 1) * pageSize + i}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer / Pagination */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> customers
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