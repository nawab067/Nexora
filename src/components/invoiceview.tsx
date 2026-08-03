"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Mail,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceRow {
  _id: string;
  invoice_no: string;
  customer_name: string;
  customer_email?: string;
  account_name: string;
  account_number: string;
  lead_name: string;
  grand_total: number;
  status: InvoiceStatus;
  issue_date: string;
  pdf_url: string;
}

interface InvoiceListViewProps {
  invoices: InvoiceRow[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onCreateInvoice: () => void;
  onView: (invoice: InvoiceRow) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSendEmail: (invoice: InvoiceRow) => void;
  stats: {
    totalInvoices: number;
    paidThisMonth: number;
    overdueInvoices: number;
  };
}

// ─── Status styling ───────────────────────────────────────────────────────────
// Kept as explicit color tokens (like CustomerInfoView's DESIGNATION_COLORS) since
// status semantics (amber/indigo/emerald/rose) are intentional brand colors, not
// theme surfaces — but each already carries its own light/dark pairing.
const STATUS_STYLES: Record<
  InvoiceStatus,
  { label: string; badge: string; dot: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500 dark:bg-amber-400",
    icon: Clock,
  },
  sent: {
    label: "Sent",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dot: "bg-indigo-500 dark:bg-indigo-400",
    icon: FileText,
  },
  paid: {
    label: "Paid",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    badge: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500 dark:bg-rose-400",
    icon: AlertCircle,
  },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0",
        s.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </Badge>
  );
}

// Same shape as CustomerInfoView's AVATAR_COLORS, so avatars look consistent
// across both pages in both themes.
const AVATAR_COLORS = [
  { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/20" },
  { bg: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/20" },
  { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
  { bg: "bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-500/20" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmt(amount: number, currency = "£") {
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Card className="min-w-0 relative overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("absolute inset-x-0 top-0 h-1", accent)} />
      <CardContent className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-3.5">
        <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground font-semibold leading-snug truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate mt-0.5">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Row actions (shared between desktop + mobile) ────────────────────────────
function RowActions({
  invoice,
  onView,
  onEdit,
  onDelete,
  onSendEmail,
}: {
  invoice: InvoiceRow;
  onView: (invoice: InvoiceRow) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSendEmail: (invoice: InvoiceRow) => void;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center justify-end gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => onView(invoice)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Preview</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-500/10"
              onClick={() => onSendEmail(invoice)}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Send to customer</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEdit(invoice._id)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(invoice._id)}
              className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 focus:bg-rose-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (page > 3) pages.push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
  if (page < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function InvoiceListView({
  invoices,
  loading,
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
  onCreateInvoice,
  onView,
  onEdit,
  onDelete,
  onSendEmail,
  stats,
}: InvoiceListViewProps) {
  const router = useRouter();

  const rangeLabel = useMemo(() => {
    if (invoices.length === 0) return "0–0";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, invoices.length);
    return `${start}–${end}`;
  }, [invoices.length, page, pageSize]);

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  return (
    <>
      {/* ── Navbar with sidebar open/close trigger ── */}
      <header className="sticky top-0 z-10 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm min-w-0">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search across CRM..."
            className="w-full text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none min-w-0"
          />
        </div>
      </header>

      <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                Invoices
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Generate, track, and manage billing for every lead.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/admin/invoice/add")}
            className="h-9 text-sm gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 w-full sm:w-auto shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={Receipt}
            label="Total Outstanding"
            value={loading ? "—" : fmt(stats.totalInvoices)}
            accent="bg-indigo-500"
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Paid This Month"
            value={loading ? "—" : fmt(stats.paidThisMonth)}
            accent="bg-emerald-500"
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={loading ? "—" : `${stats.overdueInvoices}`}
            accent="bg-rose-500"
            iconBg="bg-rose-500/10"
            iconColor="text-rose-500 dark:text-rose-400"
          />
        </div>

        {/* Toolbar */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-9 w-full text-sm rounded-lg bg-muted border-border focus-visible:ring-1"
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium shrink-0">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/70 shadow-sm overflow-hidden p-0">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-muted/50 backdrop-blur border-b border-border hover:bg-muted/50">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={onToggleAll} className="rounded" />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                    Invoice
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lead
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    PDF
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-3.5 w-28" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-3.5 w-16 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3.5 w-16" />
                      </TableCell>
                      <TableCell className="pr-5">
                        <Skeleton className="h-6 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {search ? (
                          <>
                            <SearchX className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-semibold text-foreground">
                              No results found
                            </p>
                            <p className="text-xs">Nothing matches "{search}" — try a different term</p>
                          </>
                        ) : (
                          <>
                            <Receipt className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-semibold text-foreground">
                              No invoices yet
                            </p>
                            <p className="text-xs">Create your first invoice to get started</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  invoices.map((inv, i) => {
                    const isSelected = selectedIds.has(inv._id);
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <TableRow
                        key={inv._id}
                        onClick={() => onView(inv)}
                        className={cn(
                          "group transition-colors cursor-pointer border-l-2 border-l-transparent",
                          isSelected
                            ? "bg-indigo-500/5"
                            : inv.status === "overdue"
                            ? "border-l-rose-400 hover:bg-muted/40"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleOne(inv._id)}
                            className="rounded"
                          />
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                            {inv.invoice_no}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className={cn("h-8 w-8 shrink-0 ring-2", color.ring)}>
                              <AvatarFallback className={cn(color.bg, color.text, "text-[11px] font-bold")}>
                                {getInitials(inv.customer_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground leading-tight truncate">
                                {inv.customer_name}
                              </p>
                              {inv.customer_email && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {inv.customer_email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
                            {inv.lead_name}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {inv.issue_date}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                            {fmt(inv.grand_total)}
                          </span>
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <a
                            href={inv.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full px-2.5 py-1 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            View
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </TableCell>

                        <TableCell className="pr-5" onClick={(e) => e.stopPropagation()}>
                          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                            <RowActions
                              invoice={inv}
                              onView={onView}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onSendEmail={onSendEmail}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Stacked card rows: used on mobile AND tablet/laptop widths below lg */}
          <div className="lg:hidden divide-y divide-border">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}

            {!loading && invoices.length === 0 && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground py-12 px-4 text-center">
                {search ? (
                  <>
                    <SearchX className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-semibold text-foreground">No results found</p>
                    <p className="text-xs">Nothing matches "{search}" — try a different term</p>
                  </>
                ) : (
                  <>
                    <Receipt className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-semibold text-foreground">No invoices yet</p>
                    <p className="text-xs">Create your first invoice to get started</p>
                  </>
                )}
              </div>
            )}

            {!loading &&
              invoices.map((inv, i) => {
                const isSelected = selectedIds.has(inv._id);
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div
                    key={inv._id}
                    className={cn(
                      "p-3 sm:p-4 active:bg-muted/40 border-l-2",
                      isSelected
                        ? "bg-indigo-500/5"
                        : inv.status === "overdue"
                        ? "border-l-rose-400"
                        : "border-l-transparent"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div onClick={(e) => e.stopPropagation()} className="pt-1 shrink-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleOne(inv._id)}
                          className="rounded"
                        />
                      </div>

                      <div onClick={() => onView(inv)} className="cursor-pointer flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Avatar className={cn("h-9 w-9 shrink-0 ring-2", color.ring)}>
                              <AvatarFallback className={cn(color.bg, color.text, "text-xs font-bold")}>
                                {getInitials(inv.customer_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {inv.customer_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {inv.invoice_no} · {inv.issue_date}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={inv.status} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span className="text-xs text-muted-foreground truncate">
                            {inv.lead_name}
                          </span>
                          <span className="text-sm font-semibold text-foreground shrink-0">
                            {fmt(inv.grand_total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border pl-0 sm:pl-8">
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 rounded-full px-2.5 py-1"
                      >
                        <FileText className="h-3 w-3" />
                        View PDF
                      </a>
                      <div onClick={(e) => e.stopPropagation()}>
                        <RowActions
                          invoice={inv}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onSendEmail={onSendEmail}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/20">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing <span className="font-semibold text-foreground">{rangeLabel}</span> of{" "}
              <span className="font-semibold text-foreground">{invoices.length}</span> invoices
            </p>
            <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`e-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    size="icon"
                    variant={p === page ? "default" : "outline"}
                    onClick={() => onPageChange(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-semibold shrink-0",
                      p === page && "bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                    )}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg shrink-0"
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