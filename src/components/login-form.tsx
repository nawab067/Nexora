"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit?: (data: LoginData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
}

// ─── Left panel: Stat pill ────────────────────────────────────────────────────
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
        <p className="mb-0.5 truncate text-[11px] font-medium text-white/60">
          {label}
        </p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Left panel: Feature bullet ───────────────────────────────────────────────
function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-white/80">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
      <span>{text}</span>
    </li>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginForm({
  onSubmit,
  loading = false,
  error = "",
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://nexora-crm-ai.vercel.app/auth/login-callback",
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
      {/* ── Mobile top bar (brand only, shown below lg) ── */}
      <div className="flex items-center gap-2.5 bg-indigo-600 px-5 py-4 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          LeadFlow CRM
        </span>
      </div>

      {/* ── Left panel (brand/marketing, desktop only) ── */}
      <div className="relative hidden shrink-0 flex-col overflow-hidden bg-indigo-600 px-9 py-10 lg:flex lg:w-[400px] xl:w-[440px]">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-400/25 blur-[60px]" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-[60px]" />
        </div>

        {/* Logo */}
        <div className="relative mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/20">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">
            LeadFlow CRM
          </span>
        </div>

        {/* Headline */}
        <div className="relative mb-8">
          <h2 className="mb-3 text-[28px] font-extrabold leading-tight tracking-tight text-white xl:text-[32px]">
            Welcome back,
            <br />
            <span className="text-indigo-200">let&apos;s close deals.</span>
          </h2>
          <p className="max-w-[300px] text-sm leading-relaxed text-white/65">
            Your pipeline is waiting. Log back in and pick up right where you
            left off.
          </p>
        </div>

        {/* Stats grid */}
        <div className="relative mb-9 grid grid-cols-2 gap-2.5">
          <StatPill
            icon={Users}
            label="Active Leads"
            value="12,400+"
            iconBg="rgba(255,255,255,0.18)"
            iconColor="#ffffff"
          />
          <StatPill
            icon={DollarSign}
            label="Pipeline Value"
            value="$4.2M"
            iconBg="rgba(52,211,153,0.25)"
            iconColor="#34d399"
          />
          <StatPill
            icon={TrendingUp}
            label="Conversion Rate"
            value="24.8%"
            iconBg="rgba(167,139,250,0.25)"
            iconColor="#c4b5fd"
          />
          <StatPill
            icon={BarChart2}
            label="Win Rate"
            value="62%"
            iconBg="rgba(251,191,36,0.25)"
            iconColor="#fbbf24"
          />
        </div>

        {/* Feature list */}
        <ul className="relative mt-auto flex flex-col gap-3">
          <Feature text="AI-powered email outreach per lead" />
          <Feature text="Real-time pipeline & conversion analytics" />
          <Feature text="Team collaboration with role-based access" />
          <Feature text="CSV export & third-party integrations" />
        </ul>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-6 sm:mb-7">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-[11px] w-[11px]" />
              LeadFlow CRM
            </div>
            <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to continue to your dashboard.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    autoComplete="email"
                    className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold text-slate-700">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    autoComplete="current-password"
                    className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-9 pr-10 text-sm text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[15px] w-[15px]" />
                    ) : (
                      <Eye className="h-[15px] w-[15px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <AlertCircle className="h-[15px] w-[15px] shrink-0 text-red-500" />
                  <p className="text-[13px] leading-tight text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-[15px] font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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

            {/* OAuth buttons */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          {/* Sign up link */}
          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;