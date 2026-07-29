"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Pencil,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/components/invoiceview";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface InvoiceDetail {
  _id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  createdDate: string;

  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;

  leadTitle: string;
  leadDescription?: string;

  price: number;
  discountPercent: number;
  taxPercent: number;
  currency?: string; // defaults to "£"

  paymentTerms: string;
  notes?: string;
  pdf_url: string;
}

interface InvoicePreviewViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail | null;
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (id: string) => void;
  generatingPDF?: boolean;
}

// ─── Status styling (mirrors InvoiceListView) ────────────────────────────────
const STATUS_STYLES: Record<
  InvoiceStatus,
  { label: string; badge: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  sent: {
    label: "Sent",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: FileText,
  },
  paid: {
    label: "Paid",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    badge: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
    icon: AlertCircle,
  },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmt(amount: number, currency = "£") {
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Section wrapper: consistent label + spacing for every block ────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </p>
      {children}
    </section>
  );
}

// ─── Row inside the pricing receipt ──────────────────────────────────────────
function PriceRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span
        className={cn(
          "text-sm",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium tabular-nums whitespace-nowrap",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InvoicePreviewView({
  open,
  onOpenChange,
  invoice,
  loading = false,
  onEdit,
  onDelete,
  onGeneratePDF,
  generatingPDF = false,
}: InvoicePreviewViewProps) {
  const currency = invoice?.currency ?? "£";

  const discountAmount = invoice
    ? (invoice.price * invoice.discountPercent) / 100
    : 0;
  const taxableAmount = invoice ? invoice.price - discountAmount : 0;
  const taxAmount = invoice ? (taxableAmount * invoice.taxPercent) / 100 : 0;
  const grandTotal = invoice ? taxableAmount + taxAmount : 0;

  const status = invoice ? STATUS_STYLES[invoice.status] : null;
  const StatusIcon = status?.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border overflow-hidden"
      >
        {/* ── Header strip ── */}
        <SheetHeader className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30 space-y-0">
          <SheetTitle className="sr-only">Invoice Preview</SheetTitle>
          <SheetDescription className="sr-only">
            Preview of the selected invoice
          </SheetDescription>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Invoice
              </p>
              {loading || !invoice ? (
                <Skeleton className="h-6 w-32 mt-1.5" />
              ) : (
                <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                  {invoice.invoiceNo}
                </p>
              )}
            </div>
            {loading || !invoice ? (
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shrink-0",
                  status!.badge,
                )}
              >
                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                {status!.label}
              </Badge>
            )}
          </div>

          {loading || !invoice ? (
            <Skeleton className="h-3.5 w-40 mt-2" />
          ) : (
            <p className="text-xs text-muted-foreground mt-1.5">
              Created {invoice.createdDate}
            </p>
          )}
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading || !invoice ? (
            <div className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Customer block */}
              <Section label="Customer">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 shrink-0 border border-border/60">
                    <AvatarFallback className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                      {getInitials(invoice.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1 pt-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {invoice.customerName}
                    </p>
                    {invoice.customerEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{invoice.customerEmail}</span>
                      </p>
                    )}
                    {invoice.customerPhone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3 shrink-0" />
                        {invoice.customerPhone}
                      </p>
                    )}
                    {invoice.customerAddress && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{invoice.customerAddress}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Section>

              <Separator />

              {/* Lead block */}
              <Section label="Lead">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {invoice.leadTitle}
                    </p>
                    {invoice.leadDescription && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {invoice.leadDescription}
                      </p>
                    )}
                  </div>
                </div>
              </Section>

              <Separator />

              {/* Pricing receipt */}
              <Section label="Summary">
                <div className="rounded-xl border border-border/70 bg-muted/20 px-3.5 sm:px-4 py-3.5">
                  <PriceRow label="Price" value={fmt(invoice.price, currency)} />
                  <PriceRow
                    label={`Discount (${invoice.discountPercent}%)`}
                    value={`− ${fmt(discountAmount, currency)}`}
                    muted
                  />
                  <PriceRow
                    label={`Tax (${invoice.taxPercent}%)`}
                    value={`+ ${fmt(taxAmount, currency)}`}
                    muted
                  />
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-500/10 px-3 sm:px-3.5 py-3">
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      Grand Total
                    </span>
                    <span className="text-base font-bold text-indigo-700 dark:text-indigo-300 tabular-nums whitespace-nowrap">
                      {fmt(grandTotal, currency)}
                    </span>
                  </div>
                </div>
              </Section>

              <Separator />

              {/* Payment terms */}
              <Section label="Payment Terms">
                <p className="text-sm text-foreground leading-relaxed">
                  {invoice.paymentTerms}
                </p>
              </Section>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <Separator />
                  <Section label="Notes">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      {invoice.notes}
                    </p>
                  </Section>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky footer actions ── */}
        <div className="shrink-0 border-t border-border px-4 sm:px-6 py-3.5 sm:py-4 bg-background space-y-2">
          <Button
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg gap-2 text-sm font-semibold"
            disabled={loading || !invoice || generatingPDF}
            onClick={() => invoice && onGeneratePDF(invoice._id)}
          >
            <Download className="w-4 h-4" />
            {generatingPDF ? "Generating PDF…" : "Generate PDF"}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 h-9 rounded-lg gap-1.5 text-sm"
              disabled={loading || !invoice}
              onClick={() => invoice && onEdit(invoice._id)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-9 rounded-lg gap-1.5 text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                  disabled={loading || !invoice}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove{" "}
                    <span className="font-semibold text-foreground">
                      {invoice?.invoiceNo}
                    </span>{" "}
                    and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => invoice && onDelete(invoice._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}