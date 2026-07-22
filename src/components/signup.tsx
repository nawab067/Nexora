'use client';
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sparkles,
    Eye,
    EyeOff,
    ArrowRight,
    User,
    Mail,
    Lock,
    Phone,
    Briefcase,
    CheckCircle2,
    Users,
    TrendingUp,
    DollarSign,
    BarChart2,
} from "lucide-react";

import { SignUpData } from "@/app/auth/signup/page";

// ─── Stat pill — left panel ───────────────────────────────────────────────────
function StatPill({
    icon: Icon,
    label,
    value,
    iconBg,
    iconColor,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: iconBg }}
            >
                <Icon className="h-4 w-4" style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
                <p className="mb-0.5 truncate text-[11px] font-medium text-white/60">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

// ─── Feature bullet ───────────────────────────────────────────────────────────
function Feature({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-2.5 text-sm text-white/80">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{text}</span>
        </li>
    );
}

// ─── Labeled input wrapper ────────────────────────────────────────────────────
function FieldGroup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-semibold text-slate-700">{label}</Label>
            {children}
        </div>
    );
}

// ─── Input with leading icon ──────────────────────────────────────────────────
function IconInput({
    icon: Icon,
    ...props
}: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
            <Input
                {...props}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800"
            />
        </div>
    );
}

// ─── Sign Up Page ─────────────────────────────────────────────────────────────
export default function SignUpPage({ onSignUp }: { onSignUp: (data: SignUpData) => void }) {
    const [showPassword, setShowPassword] = useState(false);
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
    const [form, setForm] = useState<SignUpData>({
        _id: "",
        name: "",
        email: "",
        password: "",
        profession: "",
        contactNumber: "",
    });

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleGoogleSignup = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "https://nexora-crm-brown.vercel.app/auth/signup-callback",
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSignUp(form);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
            {/* ── Mobile top bar (brand only, shown below lg) ── */}
            <div className="flex items-center gap-2.5 bg-indigo-600 px-5 py-4 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold tracking-tight text-white">LeadFlow CRM</span>
            </div>

            {/* ── Left panel (brand/marketing, desktop only) ── */}
            <div className="relative hidden shrink-0 flex-col overflow-hidden bg-indigo-600 px-9 py-10 lg:flex lg:w-[400px] xl:w-[440px]">
                {/* bg blobs */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-400/25 blur-[60px]" />
                    <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-[60px]" />
                </div>

                {/* Logo */}
                <div className="relative mb-10 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/20">
                        <Sparkles className="h-[18px] w-[18px] text-white" />
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-white">LeadFlow CRM</span>
                </div>

                {/* Headline */}
                <div className="relative mb-8">
                    <h2 className="mb-3 text-[28px] font-extrabold leading-tight tracking-tight text-white xl:text-[32px]">
                        Your pipeline,
                        <br />
                        <span className="text-indigo-200">fully in control.</span>
                    </h2>
                    <p className="max-w-[300px] text-sm leading-relaxed text-white/65">
                        Join thousands of sales teams who close more deals with LeadFlow&apos;s AI-powered CRM.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="relative mb-9 grid grid-cols-2 gap-2.5">
                    <StatPill icon={Users} label="Active Leads" value="12,400+" iconBg="rgba(255,255,255,0.18)" iconColor="#ffffff" />
                    <StatPill icon={DollarSign} label="Pipeline Value" value="$4.2M" iconBg="rgba(52,211,153,0.25)" iconColor="#34d399" />
                    <StatPill icon={TrendingUp} label="Conversion Rate" value="24.8%" iconBg="rgba(167,139,250,0.25)" iconColor="#c4b5fd" />
                    <StatPill icon={BarChart2} label="Win Rate" value="62%" iconBg="rgba(251,191,36,0.25)" iconColor="#fbbf24" />
                </div>

                {/* Features */}
                <ul className="relative mt-auto flex flex-col gap-3">
                    <Feature text="AI-powered email outreach per lead" />
                    <Feature text="Real-time pipeline analytics" />
                    <Feature text="Team collaboration & role-based access" />
                    <Feature text="CSV export & integrations" />
                </ul>
            </div>

            {/* ── Right panel (form) ── */}
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
                <div className="w-full max-w-[460px]">
                    {/* Heading */}
                    <div className="mb-6 sm:mb-7">
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                            <Sparkles className="h-[11px] w-[11px]" />
                            Free 14-day trial
                        </div>
                        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                            Create your account
                        </h1>
                        <p className="text-sm text-slate-500">
                            Start managing your pipeline in minutes. No credit card required.
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                            {/* Name */}
                            <FieldGroup label="Full name">
                                <IconInput
                                    icon={User}
                                    type="text"
                                    placeholder="Jane Smith"
                                    value={form.name}
                                    onChange={set("name")}
                                    required
                                />
                            </FieldGroup>

                            {/* Email */}
                            <FieldGroup label="Work email">
                                <IconInput
                                    icon={Mail}
                                    type="email"
                                    placeholder="jane@company.com"
                                    value={form.email}
                                    onChange={set("email")}
                                    required
                                />
                            </FieldGroup>

                            {/* Password */}
                            <FieldGroup label="Password">
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={set("password")}
                                        required
                                        className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-9 pr-10 text-sm text-slate-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword
                                            ? <EyeOff className="h-[15px] w-[15px]" />
                                            : <Eye className="h-[15px] w-[15px]" />}
                                    </button>
                                </div>
                            </FieldGroup>

                            {/* Profession + Contact — 2 columns on sm+, stacked on mobile */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Profession — shadcn Select */}
                                <FieldGroup label="Profession">
                                    <Select
                                        value={form.profession}
                                        onValueChange={(v) => setForm((f) => ({ ...f, profession: v }))}
                                    >
                                        <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-slate-50 pl-3 text-sm text-slate-800 data-[placeholder]:text-slate-400">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <SelectValue placeholder="Select role" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sales_rep">Sales Rep</SelectItem>
                                            <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                            <SelectItem value="account_exec">Account Executive</SelectItem>
                                            <SelectItem value="business_dev">Business Dev</SelectItem>
                                            <SelectItem value="founder">Founder / CEO</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>

                                {/* Contact number */}
                                <FieldGroup label="Contact number">
                                    <IconInput
                                        icon={Phone}
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={form.contactNumber}
                                        onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                        required
                                    />
                                </FieldGroup>
                            </div>

                            {/* Terms note */}
                            <p className="text-xs leading-relaxed text-slate-400">
                                By creating an account you agree to our{" "}
                                <a href="#" className="text-indigo-600 underline underline-offset-2">Terms of Service</a>
                                {" "}and{" "}
                                <a href="#" className="text-indigo-600 underline underline-offset-2">Privacy Policy</a>.
                            </p>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700"
                            >
                                Create account
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-5 flex items-center gap-3">
                            <Separator className="flex-1" />
                            <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                                or continue with
                            </span>
                            <Separator className="flex-1" />
                        </div>

                        {/* OAuth */}
                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                    {/* Already have account */}
                    <p className="mt-5 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}