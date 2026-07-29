"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Mail,
    Send,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    Receipt,
    FileText,
    ExternalLink,
} from "lucide-react";

// ─── State shape (mirror of AIEmailDialogState, adapted for invoices) ─────────
export interface InvoiceEmailDialogState {
    open: boolean;
    loading: boolean;
    sending: boolean;
    sent: boolean;
    error?: string | null;

    _id: string;                    // ← added: needed by the container to know which invoice to POST to on send
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;

    invoiceNo: string;
    amount: string;
    pdfUrl?: string;
}

interface InvoiceEmailDialogProps {
    invoiceEmail: InvoiceEmailDialogState;
    onClose: () => void;
    onSend: () => void;
    onSubjectChange: (v: string) => void;
    onBodyChange: (v: string) => void;
}

export default function InvoiceEmailDialog({
    invoiceEmail,
    onClose,
    onSend,
    onSubjectChange,
    onBodyChange,
}: InvoiceEmailDialogProps) {
    return (
        <Dialog open={invoiceEmail.open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold text-slate-900 leading-tight">
                                Send Invoice
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-0.5">
                                Review and edit before sending to{" "}
                                <span className="font-medium text-slate-900">
                                    {invoiceEmail.recipientName}
                                </span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="px-4 sm:px-6 py-5 space-y-4 flex-1 overflow-y-auto">
                    {invoiceEmail.loading && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Preparing invoice email…
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-full rounded-lg" />
                                <Skeleton className="h-4 w-1/3 rounded" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-5/6 rounded" />
                                <Skeleton className="h-4 w-4/5 rounded" />
                            </div>
                        </div>
                    )}

                    {!invoiceEmail.loading && invoiceEmail.error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
                            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-rose-600">{invoiceEmail.error}</p>
                        </div>
                    )}

                    {!invoiceEmail.loading && invoiceEmail.sent && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-900">Invoice sent!</p>
                            <p className="text-xs text-slate-500 text-center max-w-xs">
                                {invoiceEmail.invoiceNo} was delivered to{" "}
                                <span className="font-medium text-slate-900">
                                    {invoiceEmail.recipientEmail}
                                </span>
                            </p>
                        </div>
                    )}

                    {!invoiceEmail.loading && !invoiceEmail.sent && !invoiceEmail.error && (
                        <div className="space-y-4">
                            {/* To row */}
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide shrink-0">
                                        To
                                    </span>
                                    <span className="text-sm text-slate-900 truncate">
                                        {invoiceEmail.recipientName}{" "}
                                        <span className="text-slate-500">
                                            &lt;{invoiceEmail.recipientEmail}&gt;
                                        </span>
                                    </span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] px-2 py-0 h-5 bg-indigo-50 text-indigo-600 border-indigo-200 shrink-0"
                                >
                                    {invoiceEmail.invoiceNo}
                                </Badge>
                            </div>

                            {/* Invoice reference chip */}
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">
                                        {invoiceEmail.invoiceNo} · {invoiceEmail.amount}
                                    </span>
                                </div>
                                {invoiceEmail.pdfUrl && (
                                    <a
                                        href={invoiceEmail.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                                    >
                                        View PDF
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Subject
                                </label>
                                <Input
                                    value={invoiceEmail.subject}
                                    onChange={(e) => onSubjectChange(e.target.value)}
                                    className="h-9 text-sm border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-400"
                                    placeholder="Email subject…"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Message
                                </label>
                                <Textarea
                                    value={invoiceEmail.body}
                                    onChange={(e) => onBodyChange(e.target.value)}
                                    rows={10}
                                    className="text-sm border-slate-200 rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-indigo-400 leading-relaxed"
                                    placeholder="Email body…"
                                />
                            </div>

                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Receipt className="w-3 h-3 text-indigo-400" />
                                The invoice PDF will be attached automatically.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!invoiceEmail.loading && (
                    <DialogFooter className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex-row items-center justify-between sm:justify-between gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-900 rounded-lg h-9"
                        >
                            {invoiceEmail.sent ? "Close" : "Cancel"}
                        </Button>

                        {!invoiceEmail.sent && !invoiceEmail.error && (
                            <Button
                                size="sm"
                                onClick={onSend}
                                disabled={
                                    invoiceEmail.sending ||
                                    !invoiceEmail.subject.trim() ||
                                    !invoiceEmail.body.trim()
                                }
                                className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 text-sm font-medium"
                            >
                                {invoiceEmail.sending ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Send Invoice
                                    </>
                                )}
                            </Button>
                        )}

                        {invoiceEmail.error && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClose}
                                className="h-9 gap-2 rounded-lg px-5 text-sm border-rose-300 text-rose-600 hover:bg-rose-50"
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