'use client';

import { Button } from "@/components/ui/button";
import {
    Trash2,
    Mail,
    Clock,
    Bell,
    HelpCircle,
    Settings,
    Search,
    RefreshCw,
    Inbox,
    AlertTriangle,
    X,
    CheckSquare,
    ArrowLeft,
    Reply,
    MailOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import React, { useMemo, useRef, useState } from "react";
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
    onDeleted?: (id: string) => void; // single delete
    onBulkDeleted?: (ids: string[]) => void; // bulk delete
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

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const LONG_PRESS_MS = 450;

// ─── Inbox row ──────────────────────────────────────────────────────────────
function ReminderRow({
    reply,
    active,
    onClick,
    selectionMode,
    selected,
    onLongPress,
    onToggleSelect,
    onQuickDelete,
}: {
    reply: EmailReply;
    active: boolean;
    onClick: () => void;
    selectionMode: boolean;
    selected: boolean;
    onLongPress: () => void;
    onToggleSelect: () => void;
    onQuickDelete: () => void;
}) {
    const color = AVATAR_COLORS[hashString(reply.customer_email) % AVATAR_COLORS.length];
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firedLongPress = useRef(false);

    const startPress = () => {
        firedLongPress.current = false;
        pressTimer.current = setTimeout(() => {
            firedLongPress.current = true;
            onLongPress();
        }, LONG_PRESS_MS);
    };
    const clearPress = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };
    const handleClick = () => {
        if (firedLongPress.current) {
            firedLongPress.current = false;
            return;
        }
        if (selectionMode) onToggleSelect();
        else onClick();
    };

    return (
        <div
            onPointerDown={startPress}
            onPointerUp={clearPress}
            onPointerLeave={clearPress}
            onPointerCancel={clearPress}
            onContextMenu={(e) => {
                e.preventDefault();
                if (!selectionMode) onLongPress();
            }}
            onClick={handleClick}
            className={cn(
                "group relative flex items-center gap-3 px-3 py-3 border-b border-border cursor-pointer select-none transition-colors",
                active
                    ? "bg-indigo-500/[0.07]"
                    : selected
                    ? "bg-indigo-500/5"
                    : "hover:bg-muted/50"
            )}
        >
            {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-indigo-600 rounded-r" />
            )}

            {/* checkbox: visible always in selection mode, fades in on hover otherwise */}
            <div
                className={cn(
                    "shrink-0 transition-opacity",
                    selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            >
                <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleSelect()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="h-4 w-4"
                />
            </div>

            <div
                className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    color.bg,
                    color.text
                )}
            >
                {getInitials(reply.customer_email)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span
                        className={cn(
                            "text-sm truncate",
                            !reply.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        )}
                    >
                        {reply.customer_email}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {timeAgo(reply.received_at)}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuickDelete();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </span>
                </div>
                <p
                    className={cn(
                        "text-[13px] truncate mt-0.5",
                        !reply.is_read ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                >
                    {reply.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{reply.message}</p>
            </div>

            {!reply.is_read && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            )}
        </div>
    );
}

// ─── "Not wired up" alert ────────────────────────────────────────────────────
function NotConnectedAlert() {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 m-4">
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
    onBulkDeleted,
}: RemindersViewProps) {
    const isDisconnected = reminders === undefined;
    const safeReminders = reminders ?? [];
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

    const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EmailReply | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [filter, setFilter] = useState<"all" | "unread">("all");

    // ── Multi-select state ──
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const unreadCount = useMemo(
        () => safeReminders.filter((r) => !r.is_read).length,
        [safeReminders]
    );

    const visibleReminders = useMemo(
        () => (filter === "unread" ? safeReminders.filter((r) => !r.is_read) : safeReminders),
        [safeReminders, filter]
    );

    const enterSelectionMode = (id: string) => {
        setSelectionMode(true);
        setSelectedIds(new Set([id]));
    };

    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            if (next.size === 0) setSelectionMode(false);
            return next;
        });
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    };

    const openDeleteConfirm = (reply: EmailReply) => {
        setDeleteTarget(reply);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await axios.delete(`${baseurl}/delete/${deleteTarget._id}`);
            onDeleted?.(deleteTarget._id);
            if (selectedReply?._id === deleteTarget._id) setSelectedReply(null);
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setBulkDeleting(true);
        try {
            const results = await Promise.allSettled(
                ids.map((id) => axios.delete(`${baseurl}/delete/${id}`))
            );
            const succeededIds = ids.filter((_, i) => results[i].status === "fulfilled");
            if (succeededIds.length > 0) {
                onBulkDeleted?.(succeededIds);
                if (selectedReply && succeededIds.includes(selectedReply._id)) {
                    setSelectedReply(null);
                }
            }
        } finally {
            setBulkDeleting(false);
            setBulkDeleteConfirmOpen(false);
            exitSelectionMode();
        }
    };

    const openReply = (reply: EmailReply) => {
        setSelectedReply(reply);
        onReplyClick?.(reply);
    };

    const selectedColor = selectedReply
        ? AVATAR_COLORS[hashString(selectedReply.customer_email) % AVATAR_COLORS.length]
        : null;

    return (
        <>
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-10 h-14 bg-background border-b border-border flex items-center px-4 gap-3 shrink-0">
                {selectionMode ? (
                    <>
                        <button
                            onClick={exitSelectionMode}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">{selectedIds.size} selected</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds(new Set(visibleReminders.map((r) => r._id)))}
                            className="h-8 text-xs gap-1.5 text-muted-foreground"
                        >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Select all
                        </Button>
                        <div className="ml-auto">
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={selectedIds.size === 0}
                                onClick={() => setBulkDeleteConfirmOpen(true)}
                                className="h-9 text-sm gap-1.5 rounded-lg px-4"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </header>

            {/* ── Page body ── */}
            <div className="flex flex-col bg-background min-h-[calc(100vh-3.5rem)]">
                <div className="px-6 pt-6 pb-4 flex items-start justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Reminders & Notifications</h1>
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

                <div className="px-6 flex gap-4 shrink-0">
                    <Card className="flex-1 bg-card border border-border shadow-sm rounded-xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total Replies</p>
                                <p className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
                                    {loading ? "—" : safeReminders.length}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Mail className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 bg-card border border-border shadow-sm rounded-xl">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Unread</p>
                                <p className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
                                    {loading ? "—" : unreadCount}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <MailOpen className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isDisconnected && <NotConnectedAlert />}

                {/* ── Inbox: list + reading pane ── */}
                <div className="flex-1 mt-4 mx-6 mb-6 border border-border rounded-xl overflow-hidden bg-card min-h-[520px] flex">
                    {/* List panel */}
                    <div
                        className={cn(
                            "flex-col w-full lg:w-[380px] lg:border-r border-border shrink-0",
                            selectedReply ? "hidden lg:flex" : "flex"
                        )}
                    >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
                            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="all" className="text-xs px-3 h-6">
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger value="unread" className="text-xs px-3 h-6">
                                        Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex gap-3 px-3 py-3 border-b border-border">
                                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Skeleton className="h-3 w-32" />
                                                <Skeleton className="h-3 w-10" />
                                            </div>
                                            <Skeleton className="h-3 w-40" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                ))}

                            {!loading && !isDisconnected && visibleReminders.length === 0 && (
                                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                                    <Inbox className="h-10 w-10 opacity-20" />
                                    <p className="text-sm font-semibold text-foreground">
                                        {filter === "unread" ? "No unread replies" : "No reminders yet"}
                                    </p>
                                    <p className="text-xs">Click Sync to check for new customer replies</p>
                                </div>
                            )}

                            {!loading &&
                                visibleReminders.map((reply) => (
                                    <ReminderRow
                                        key={reply._id}
                                        reply={reply}
                                        active={selectedReply?._id === reply._id}
                                        selectionMode={selectionMode}
                                        selected={selectedIds.has(reply._id)}
                                        onLongPress={() => enterSelectionMode(reply._id)}
                                        onToggleSelect={() => toggleSelected(reply._id)}
                                        onQuickDelete={() => openDeleteConfirm(reply)}
                                        onClick={() => openReply(reply)}
                                    />
                                ))}
                        </div>
                    </div>

                    {/* Reading pane */}
                    <div
                        className={cn(
                            "flex-col flex-1 min-w-0",
                            selectedReply ? "flex" : "hidden lg:flex"
                        )}
                    >
                        {!selectedReply && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Mail className="h-10 w-10 opacity-20" />
                                <p className="text-sm">Select a reminder to read</p>
                            </div>
                        )}

                        {selectedReply && selectedColor && (
                            <>
                                <div className="flex items-start gap-3 px-6 py-5 border-b border-border shrink-0">
                                    <button
                                        onClick={() => setSelectedReply(null)}
                                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>

                                    <div
                                        className={cn(
                                            "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                            selectedColor.bg,
                                            selectedColor.text
                                        )}
                                    >
                                        {getInitials(selectedReply.customer_email)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-base font-semibold text-foreground break-words">
                                                {selectedReply.subject}
                                            </h2>
                                            {!selectedReply.is_read && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-semibold border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shrink-0"
                                                >
                                                    NEW
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-1">
                                            <a
                                                href={`mailto:${selectedReply.customer_email}`}
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                {selectedReply.customer_email}
                                            </a>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(selectedReply.received_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openDeleteConfirm(selectedReply)}
                                        className="h-8 w-8 rounded-lg text-rose-600 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-5">
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words">
                                        {selectedReply.message}
                                    </p>
                                </div>

                                <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">
                                    <a
                                        href={`mailto:${selectedReply.customer_email}?subject=${encodeURIComponent(
                                            `Re: ${selectedReply.subject}`
                                        )}`}
                                        className="flex items-center gap-1.5 h-9 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4"
                                    >
                                        <Reply className="w-4 h-4" />
                                        Reply
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Single delete confirmation ── */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <div className="w-11 h-11 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <AlertDialogTitle className="text-base font-semibold">Delete this reminder?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            {deleteTarget && (
                                <>
                                    This will permanently remove the reply from{" "}
                                    <span className="font-medium text-foreground">{deleteTarget.customer_email}</span>{" "}
                                    regarding <span className="font-medium text-foreground">"{deleteTarget.subject}"</span>.
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

            {/* ── Bulk delete confirmation ── */}
            <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <div className="w-11 h-11 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <AlertDialogTitle className="text-base font-semibold">
                            Delete {selectedIds.size} reminder{selectedIds.size !== 1 ? "s" : ""}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            This will permanently remove the selected replies. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-sm rounded-lg" disabled={bulkDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleBulkDelete();
                            }}
                            disabled={bulkDeleting}
                            className="h-9 text-sm rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                        >
                            {bulkDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}