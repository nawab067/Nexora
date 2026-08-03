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
const STATUS_STYLES: Record<
  InvoiceStatus,
  { label: string; badge: string; dot: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20",
    dot: "bg-amber-500 dark:bg-amber-400",
    icon: Clock,
  },
  sent: {
    label: "Sent",
    badge:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20",
    dot: "bg-indigo-500 dark:bg-indigo-400",
    icon: FileText,
  },
  paid: {
    label: "Paid",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    badge:
      "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20",
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
        "gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap border-0 ring-1 ring-inset shrink-0",
        s.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </Badge>
  );
}

const AVATAR_COLORS = [
  {
    bg: "bg-blue-50 dark:bg-blue-400/10",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-100 dark:ring-blue-400/20",
  },
  {
    bg: "bg-indigo-50 dark:bg-indigo-400/10",
    text: "text-indigo-700 dark:text-indigo-400",
    ring: "ring-indigo-100 dark:ring-indigo-400/20",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-400/10",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-100 dark:ring-emerald-400/20",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-400/10",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-100 dark:ring-amber-400/20",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-400/10",
    text: "text-rose-700 dark:text-rose-400",
    ring: "ring-rose-100 dark:ring-rose-400/20",
  },
  {
    bg: "bg-teal-50 dark:bg-teal-400/10",
    text: "text-teal-700 dark:text-teal-400",
    ring: "ring-teal-100 dark:ring-teal-400/20",
  },
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
    <Card className="min-w-0 relative overflow-hidden border-slate-200/70 dark:border-slate-800 shadow-sm ring-1 ring-slate-900/[0.02] dark:ring-white/[0.03] transition-shadow hover:shadow-md dark:bg-slate-900">
      <div className={cn("absolute inset-x-0 top-0 h-1", accent)} />
      <CardContent className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-3.5">
        <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold leading-snug truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight truncate mt-0.5">
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
              className="h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="h-8 w-8 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-400/10"
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
              className="h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-400/10"
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
      <header className="sticky top-0 z-10 h-14 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
        <SidebarTrigger className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 shrink-0" />
        <Separator orientation="vertical" className="h-5 hidden sm:block dark:bg-slate-800" />
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm min-w-0">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search across CRM..."
            className="w-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent outline-none min-w-0"
          />
        </div>
      </header>

      <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-3.5rem)]">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Invoices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
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
            iconBg="bg-indigo-50 dark:bg-indigo-400/10"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Paid This Month"
            value={loading ? "—" : fmt(stats.paidThisMonth)}
            accent="bg-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-400/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={loading ? "—" : `${stats.overdueInvoices}`}
            accent="bg-rose-500"
            iconBg="bg-rose-50 dark:bg-rose-400/10"
            iconColor="text-rose-500 dark:text-rose-400"
          />
        </div>

        {/* Toolbar */}
        <Card className="border-slate-200/70 dark:border-slate-800 shadow-sm ring-1 ring-slate-900/[0.02] dark:ring-white/[0.03] dark:bg-slate-900">
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <Input
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-9 w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200/70 dark:border-slate-800 shadow-sm ring-1 ring-slate-900/[0.02] dark:ring-white/[0.03] overflow-hidden p-0 dark:bg-slate-900">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/95 dark:hover:bg-slate-900/95">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={onToggleAll} className="rounded" />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3">
                    Invoice
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Customer
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lead
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Date
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    PDF
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right pr-5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="dark:hover:bg-slate-900">
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
                  <TableRow className="dark:hover:bg-transparent">
                    <TableCell colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                        {search ? (
                          <>
                            <SearchX className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              No results found
                            </p>
                            <p className="text-xs">Nothing matches "{search}" — try a different term</p>
                          </>
                        ) : (
                          <>
                            <Receipt className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                            ? "bg-indigo-500/5 dark:bg-indigo-400/10"
                            : inv.status === "overdue"
                            ? "border-l-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
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
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight truncate">
                                {inv.customer_name}
                              </p>
                              {inv.customer_email && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {inv.customer_email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[160px] block">
                            {inv.lead_name}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {inv.issue_date}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                            {fmt(inv.grand_total)}
                          </span>
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <a
                            href={inv.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 hover:bg-indigo-100 dark:hover:bg-indigo-400/20 rounded-full px-2.5 py-1 transition-colors"
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
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
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
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 py-12 px-4 text-center">
                {search ? (
                  <>
                    <SearchX className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No results found</p>
                    <p className="text-xs">Nothing matches "{search}" — try a different term</p>
                  </>
                ) : (
                  <>
                    <Receipt className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No invoices yet</p>
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
                      "p-3 sm:p-4 active:bg-slate-50 dark:active:bg-slate-800/50 border-l-2",
                      isSelected
                        ? "bg-indigo-500/5 dark:bg-indigo-400/10"
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
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                                {inv.customer_name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {inv.invoice_no} · {inv.issue_date}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={inv.status} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {inv.lead_name}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 shrink-0">
                            {fmt(inv.grand_total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-0 sm:pl-8">
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 rounded-full px-2.5 py-1"
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
          <div className="border-t border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Showing <span className="font-semibold text-slate-900 dark:text-slate-50">{rangeLabel}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">{invoices.length}</span> invoices
            </p>
            <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`e-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500"
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
                      p === page
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800"
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
                className="w-8 h-8 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shrink-0"
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