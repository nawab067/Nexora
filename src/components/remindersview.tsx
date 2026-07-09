'use client';

import { Button } from "@/components/ui/button";
import { Trash2, Mail, Clock, Bell, HelpCircle, Settings, Search, RefreshCw, Inbox, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";
import axios from "axios";

// ─── Data shape (matches your /email-replies/user/:id response) ───────────────
export interface EmailReply {
    _id: string;
    userid: string;
    customer_id: string;
    customer_email: string;
    subject: string;
    message: string;
    received_at: string;
    is_read?: boolean;
}

interface RemindersViewProps {
    reminders?: EmailReply[];
    loading?: boolean;
    onSync?: () => void;
    onReplyClick?: (reply: EmailReply) => void;
    onDeleted?: (id: string) => void; // optional: let parent remove it from state after successful delete
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(email: string) {
    return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
    { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
    { bg: "bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400" },
    { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" },
    { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400" },
];

function hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ─── Reminder card ──────────────────────────────────────────────────────────────
export function ReminderCard({
    reply,
    onClick,
}: {
    reply: EmailReply;
    onClick: () => void;
}) {
    const color = AVATAR_COLORS[hashString(reply.customer_email) % AVATAR_COLORS.length];

    return (
        <div
            onClick={onClick}
            className="group flex gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer"
        >
            <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                color.bg, color.text
            )}>
                {getInitials(reply.customer_email)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {reply.subject}
                        </p>
                        <a
                            href={`mailto:${reply.customer_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            {reply.customer_email}
                        </a>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {timeAgo(reply.received_at)}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                    {reply.message}
                </p>

                {!reply.is_read && (
                    <div className="mt-2">
                        <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-indigo-500/20 bg-indigo-500/10 text-indigo-600"
                        >
                            NEW REPLY
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── "Not wired up" alert ────────────────────────────────────────────────────
function NotConnectedAlert() {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">Data not connected</p>
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        SETUP NEEDED
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    This view isn&apos;t receiving <code className="px-1 py-0.5 rounded bg-muted text-foreground">reminders</code>,{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-foreground">loading</code>, or{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-foreground">onSync</code> props from its parent page yet.
                </p>
            </div>
        </div>
    );
}

// ─── Main view component ────────────────────────────────────────────────────────
export default function RemindersView({
    reminders,
    loading = false,
    onSync,
    onReplyClick,
    onDeleted,
}: RemindersViewProps) {
    const isDisconnected = reminders === undefined;
    const safeReminders = reminders ?? [];
    const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

    const handleDelete = async () => {
        if (!selectedReply) return;
        setDeleting(true);
        try {
            await axios.delete(`${baseurl}/delete/${selectedReply._id}`);
            onDeleted?.(selectedReply._id);
            setDeleteConfirmOpen(false);
            setSelectedReply(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
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
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Reminders & Notifications
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Customer replies that need your attention.
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={onSync}
                        disabled={loading || !onSync}
                        className="h-9 text-sm gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 disabled:opacity-70"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        {loading ? "Syncing..." : "Sync"}
                    </Button>
                </div>

                {isDisconnected && <NotConnectedAlert />}

                <div className="flex gap-4">
                    <Card className="flex-1 bg-card border border-border shadow-sm rounded-xl">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Replies</p>
                                <p className="text-3xl font-bold text-foreground tracking-tight mt-1">
                                    {loading ? "—" : safeReminders.length}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-3">
                    {loading && Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
                            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3.5 w-40" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-3.5 w-full" />
                            </div>
                        </div>
                    ))}

                    {!loading && !isDisconnected && safeReminders.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground bg-card border border-border rounded-xl">
                            <Inbox className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-semibold text-foreground">No reminders yet</p>
                            <p className="text-xs">Click Sync to check for new customer replies</p>
                        </div>
                    )}

                    {!loading && safeReminders.map((reply) => (
                        <ReminderCard
                            key={reply._id}
                            reply={reply}
                            onClick={() => {
                                setSelectedReply(reply);
                                onReplyClick?.(reply);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Reply detail dialog ── */}
            <Dialog
                open={!!selectedReply}
                onOpenChange={(open) => {
                    if (!open) setSelectedReply(null);
                }}
            >
                <DialogContent className="w-full max-w-lg p-0 overflow-hidden rounded-xl border border-border">
                    {selectedReply && (() => {
                        const color = AVATAR_COLORS[hashString(selectedReply.customer_email) % AVATAR_COLORS.length];
                        return (
                            <>
                                {/* Header */}
                                <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
                                    <div className="flex items-start gap-3 w-full">
                                        <div className={cn(
                                            "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                            color.bg, color.text
                                        )}>
                                            {getInitials(selectedReply.customer_email)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <DialogTitle className="text-base font-semibold text-foreground break-words">
                                                    {selectedReply.subject}
                                                </DialogTitle>
                                                {!selectedReply.is_read && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] font-semibold border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shrink-0"
                                                    >
                                                        NEW
                                                    </Badge>
                                                )}
                                            </div>

                                            <DialogDescription asChild>
                                                <div className="flex items-center justify-between gap-2 mt-1">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap min-w-0">
                                                        <a
                                                            href={`mailto:${selectedReply.customer_email}`}
                                                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[160px]"
                                                        >
                                                            {selectedReply.customer_email}
                                                        </a>
                                                        <span className="shrink-0">•</span>
                                                        <span className="flex items-center gap-1 shrink-0">
                                                            <Clock className="w-3 h-3" />
                                                            {timeAgo(selectedReply.received_at)}
                                                        </span>
                                                    </div>

                                                    {/* Trash button — right next to the timestamp */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteConfirmOpen(true)}
                                                        className="h-7 w-7 rounded-lg text-rose-600 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <Separator />

                                {/* Message body */}
                                <div className="px-6 py-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                        Message
                                    </p>
                                    <div className="rounded-xl border border-border bg-muted/40 p-4 max-h-64 overflow-y-auto">
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words">
                                            {selectedReply.message}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Footer actions */}
                                <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-sm rounded-lg border-border w-full sm:w-auto"
                                        onClick={() => setSelectedReply(null)}
                                    >
                                        Close
                                    </Button>
                                    <a
                                        href={`mailto:${selectedReply.customer_email}?subject=${encodeURIComponent(`Re: ${selectedReply.subject}`)}`}
                                        className="flex items-center gap-1.5 w-full justify-center h-9 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 sm:w-auto"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Reply
                                    </a>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* ── Delete confirmation ── */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <div className="w-11 h-11 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <AlertDialogTitle className="text-base font-semibold">
                            Delete this reminder?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            {selectedReply && (
                                <>
                                    This will permanently remove the reply from{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedReply.customer_email}
                                    </span>{" "}
                                    regarding <span className="font-medium text-foreground">"{selectedReply.subject}"</span>.
                                    This action cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-sm rounded-lg" disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleting}
                            className="h-9 text-sm rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}