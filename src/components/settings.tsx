'use client';

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Bell,
    HelpCircle,
    Settings as SettingsIcon,
    Sun,
    Moon,
    Monitor,
    Check,
    Palette,
    User,
    Shield,
    Bell as BellIcon,
    Mail,
    KeyRound,
    Eye,
    EyeOff,
    Loader2,
    ServerCog,
    Trash2,
    TriangleAlert,
    LogOut,
    ChevronsUpDown,
    Plus,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";


const baseurl= process.env.NEXT_PUBLIC_BASE_URL;
// ─── Sidebar-style settings nav (visual grouping, mirrors sticky-header pattern) ──
const NAV_SECTIONS = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "profile", label: "Switch account & Logout", icon: User },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Account & users", icon: Shield },
] as const;

type SectionId = (typeof NAV_SECTIONS)[number]["id"];

// ─── Theme option card ─────────────────────────────────────────────────────────
type ThemeOption = "light" | "dark" | "system";

function ThemeCard({
    value,
    current,
    onSelect,
}: {
    value: ThemeOption;
    current: string | undefined;
    onSelect: (v: ThemeOption) => void;
}) {
    const isActive = current === value;

    const meta: Record<
        ThemeOption,
        { label: string; sub: string; icon: React.ElementType }
    > = {
        light: { label: "Light", sub: "Bright background, dark text", icon: Sun },
        dark: { label: "Dark", sub: "Deep slate background, soft text", icon: Moon },
        system: { label: "System", sub: "Match your device setting", icon: Monitor },
    };

    const { label, sub, icon: Icon } = meta[value];

    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
                "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
                "hover:shadow-sm",
                isActive
                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-400"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
            )}
        >
            {isActive && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
            )}

            <div
                className={cn(
                    "w-full h-20 rounded-lg border mb-3 overflow-hidden flex items-center justify-center",
                    value === "light" && "bg-white border-slate-200",
                    value === "dark" && "bg-slate-900 border-slate-700",
                    value === "system" &&
                    "bg-gradient-to-br from-white via-white to-slate-900 border-slate-300"
                )}
            >
                <Icon
                    className={cn(
                        "w-6 h-6",
                        value === "light" && "text-amber-500",
                        value === "dark" && "text-slate-300",
                        value === "system" && "text-slate-500"
                    )}
                />
            </div>

            <div className="flex items-center gap-2 mb-0.5">
                <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {label}
                </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
        </button>
    );
}

// ─── Matches the Setting type in SettingsPage container ────────────────────────
interface Account {
    _id: string;
    userid: string;
    email: string;
}

// ─── Props contract — matches SettingsPage container, plus optional logout hook ─
interface SettingsProps {
    email: string;
    appKey: string;
    loading: boolean;
    account: Account | null;
    onEmailChange: (value: string) => void;
    onAppKeyChange: (value: string) => void;
    onSave: () => void | Promise<void>;
    ondelete: () => void | Promise<void>;
    onLogout?: () => void | Promise<void>;
}

// ─── Account & Users panel (pure view — no local email/appKey/saving state) ────
function AccountUsersPanel({
    email,
    appKey,
    loading,
    account,
    onEmailChange,
    onAppKeyChange,
    onSave,
    ondelete,
}: Omit<SettingsProps, "onLogout">) {
    const [showKey, setShowKey] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false); // NEW

    const handleSaveClick = async () => {
        try {
            await onSave();
            toast.success("Backend is ready", {
                description: "Your email and app password key have been saved.",
                icon: <ServerCog className="w-4 h-4" />,
            });
        } catch (err: any) {
            // NEW: distinguish "already registered" from generic failure
            if (err?.code === "DUPLICATE_EMAIL") {
                setDuplicateDialogOpen(true);
                return;
            }
            toast.error("Save failed", {
                description: "Could not save your credentials. Please try again.",
            });
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setDeleting(true);
            await ondelete();
            setDialogOpen(false);
            toast.success("Email removed", {
                description: "The connected account has been deleted.",
                icon: <Trash2 className="w-4 h-4" />,
            });
        } catch {
            toast.error("Delete failed", {
                description: "Could not remove this account. Please try again.",
            });
        } finally {
            setDeleting(false);
        }
    };
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Account & Users
                    </h2>
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0 h-5 bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                    >
                        Secure
                    </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Connect your email and app password key for backend access.
                </p>
            </div>

            <div className="p-4 sm:p-5 space-y-5 max-w-md">
                {/* Email field */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Label
                            htmlFor="account-email"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                        >
                            Email
                        </Label>

                        {account?.email && (
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full pl-2 pr-2 py-0.5 max-w-[160px] sm:max-w-[180px]">
                                    <Check className="w-3 h-3 shrink-0" strokeWidth={3} />
                                    <span className="truncate">{account.email}</span>
                                </span>

                                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Delete saved email"
                                            className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-xl border-slate-200 dark:border-slate-800 w-[calc(100vw-2rem)] sm:w-full sm:max-w-md">
                                        <AlertDialogHeader>
                                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2">
                                                <TriangleAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                                                Delete connected email?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                                This will permanently remove{" "}
                                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                                    {account.email}
                                                </span>{" "}
                                                and its app password key from the backend. This action
                                                cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                disabled={deleting}
                                                className="h-9 text-sm rounded-lg border-slate-200 dark:border-slate-700"
                                            >
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDeleteConfirm();
                                                }}
                                                disabled={deleting}
                                                className="h-9 text-sm gap-1.5 bg-red-600 hover:bg-red-500 focus:ring-red-500 rounded-lg"
                                            >
                                                {deleting ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </>
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="account-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            className="h-9 text-sm rounded-lg bg-slate-50 border-slate-200 pl-9 focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700"
                        />
                    </div>
                </div>

                {/* App password key field */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="account-appkey"
                        className="text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                        App Password Key
                    </Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="account-appkey"
                            type={showKey ? "text" : "password"}
                            placeholder="••••  ••••  ••••  ••••"
                            value={appKey}
                            onChange={(e) => onAppKeyChange(e.target.value)}
                            className="h-9 text-sm rounded-lg bg-slate-50 border-slate-200 pl-9 pr-9 focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showKey ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Generated from your email provider's app-specific password settings.
                    </p>
                </div>

                <Separator className="dark:bg-slate-800" />

                <div className="flex items-center justify-end gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-sm rounded-lg border-slate-200 dark:border-slate-700"
                        onClick={() => {
                            onEmailChange("");
                            onAppKeyChange("");
                        }}
                        disabled={loading}
                    >
                        Clear
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveClick}
                        disabled={loading || !email || !appKey}
                        className="h-9 text-sm gap-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save credentials"
                        )}
                    </Button>
                </div>
            </div>
            <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
                <AlertDialogContent className="rounded-xl border-slate-200 dark:border-slate-800 w-[calc(100vw-2rem)] sm:w-full sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-2">
                            <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                            Email already registered
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                            This email is already connected to your account. Please use a
                            different email, or remove the existing one before adding it again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setDuplicateDialogOpen(false)}
                            className="h-9 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg"
                        >
                            Got it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ─── Profile panel — account summary, Switch Account, and Logout ───────────────
function ProfilePanel({
    account,
    onLogout,
}: {
    account: Account | null;
    onLogout?: () => void | Promise<void>;
}) {
    const [loggingOut, setLoggingOut] = React.useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const router = useRouter();

    const initials = account?.email ? account.email.slice(0, 2).toUpperCase() : "U";

     const handleLogout = async () => {
    try {
      await axios.post(
        `${baseurl}/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage the account you're signed in with.
                </p>
            </div>

            <div className="p-4 sm:p-5 space-y-5 max-w-md">
                {/* Current account summary */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border border-slate-200 dark:border-slate-700">
                        <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {account?.email ?? "No account connected"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in</p>
                    </div>
                </div>

                <Separator className="dark:bg-slate-800" />

                {/* Switch account */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Switch account
                    </Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full h-11 justify-between rounded-lg border-slate-200 dark:border-slate-700 font-normal"
                            >
                                <span className="flex items-center gap-2 min-w-0">
                                    <Avatar className="w-6 h-6 shrink-0">
                                        <AvatarFallback className="bg-blue-600 text-white text-[10px] font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-slate-700 dark:text-slate-200">
                                        {account?.email ?? "No account"}
                                    </span>
                                </span>
                                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px]"
                        >
                            <DropdownMenuLabel className="text-xs text-slate-400">
                                Accounts
                            </DropdownMenuLabel>
                            {account?.email && (
                                <DropdownMenuItem className="gap-2">
                                    <Avatar className="w-5 h-5 shrink-0">
                                        <AvatarFallback className="bg-blue-600 text-white text-[9px]">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{account.email}</span>
                                    <Check className="w-3.5 h-3.5 ml-auto text-blue-600 shrink-0" />
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-slate-500 dark:text-slate-400">
                                <Plus className="w-3.5 h-3.5" />
                                Add another account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Separator className="dark:bg-slate-800" />

                {/* Logout */}
                <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full h-11 gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border-slate-200 dark:border-slate-800 w-[calc(100vw-2rem)] sm:w-full sm:max-w-md">
                        <AlertDialogHeader>
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2">
                                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <AlertDialogTitle className="text-slate-800 dark:text-slate-100">
                                Log out of your account?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                You'll need to sign back in to access your workspace.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={loggingOut}
                                className="h-9 text-sm rounded-lg border-slate-200 dark:border-slate-700"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                                disabled={loggingOut}
                                className="h-9 text-sm gap-1.5 bg-red-600 hover:bg-red-500 focus:ring-red-500 rounded-lg"
                            >
                                {loggingOut ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-3.5 h-3.5" />
                                        Log out
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

// ─── Main Settings view — receives everything from SettingsPage container ──────
export default function Settings({
    email,
    appKey,
    loading,
    account,
    onEmailChange,
    onAppKeyChange,
    ondelete,
    onSave,
    onLogout,
}: SettingsProps): React.JSX.Element {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState<SectionId>("appearance");

    // Avoid hydration mismatch — next-themes only knows the real theme client-side
    React.useEffect(() => setMounted(true), []);

    return (
        <>
            {/* ── Navbar (matches Leads page header) ── */}
            <header className="sticky top-0 z-10 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
                <SidebarTrigger className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shrink-0" />
                <Separator orientation="vertical" className="h-5 shrink-0" />
                <div className="flex items-center gap-2 min-w-0">
                    <SettingsIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                        Settings
                    </span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                    <Separator orientation="vertical" className="h-5 mx-1 sm:mx-2 hidden sm:block" />
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        AR
                    </div>
                </div>
            </header>

            {/* ── Page body ── */}
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-3.5rem)]">
                <div className="max-w-5xl mx-auto">
                    {/* Page heading */}
                    <div className="mb-5 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            Settings
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage your workspace preferences and account.
                        </p>
                    </div>

                    {/* ── Mobile / tablet section switcher (shown below md) ── */}
                    <div className="md:hidden -mx-4 sm:-mx-6 mb-5 px-4 sm:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {NAV_SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 border",
                                        activeSection === section.id
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <section.icon className="w-3.5 h-3.5 shrink-0" />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* ── Left settings nav (desktop / tablet) ── */}
                        <aside className="w-52 shrink-0 hidden md:block">
                            <nav className="space-y-1 sticky top-20">
                                {NAV_SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                            activeSection === section.id
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                        )}
                                    >
                                        <section.icon className="w-4 h-4 shrink-0" />
                                        {section.label}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* ── Right content ── */}
                        <div className="flex-1 min-w-0 space-y-5">
                            {activeSection === "appearance" && (
                                <>
                                    {/* Appearance card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 flex-wrap">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                        Appearance
                                                    </h2>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-2 py-0 h-5 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                                                    >
                                                        Workspace-wide
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    Choose how the CRM looks. This applies to every page.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-5">
                                            {!mounted ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {Array.from({ length: 3 }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="h-[148px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 animate-pulse"
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <ThemeCard
                                                        value="light"
                                                        current={theme}
                                                        onSelect={setTheme}
                                                    />
                                                    <ThemeCard
                                                        value="dark"
                                                        current={theme}
                                                        onSelect={setTheme}
                                                    />
                                                    <ThemeCard
                                                        value="system"
                                                        current={theme}
                                                        onSelect={setTheme}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick toggle row */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 sm:px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                {mounted && theme === "dark" ? (
                                                    <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                                                ) : (
                                                    <Sun className="w-4 h-4 text-amber-500" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    Dark mode
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {mounted
                                                        ? theme === "dark"
                                                            ? "Currently on"
                                                            : "Currently off"
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setTheme(theme === "dark" ? "light" : "dark")
                                            }
                                            className="h-9 text-sm gap-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg shrink-0"
                                            disabled={!mounted}
                                        >
                                            {mounted && theme === "dark" ? (
                                                <>
                                                    <Sun className="w-3.5 h-3.5" />
                                                    Switch to light
                                                </>
                                            ) : (
                                                <>
                                                    <Moon className="w-3.5 h-3.5" />
                                                    Switch to dark
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {activeSection === "profile" && (
                                <ProfilePanel account={account} onLogout={onLogout} />
                            )}

                            {activeSection === "security" && (
                                <AccountUsersPanel
                                    email={email}
                                    appKey={appKey}
                                    loading={loading}
                                    account={account}
                                    onEmailChange={onEmailChange}
                                    onAppKeyChange={onAppKeyChange}
                                    onSave={onSave}
                                    ondelete={ondelete}
                                />
                            )}

                            {activeSection === "notifications" && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                                    <p className="text-sm text-slate-400 dark:text-slate-500">
                                        Notification settings coming soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}