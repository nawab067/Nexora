"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Users,
  TrendingUp,
  DollarSign,
  BarChart2,
  ArrowRight,
} from "lucide-react";

// ─── Stat Card — identical to CustomerInfoView StatCard ───────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor,
  iconBg,
  iconColor,
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
    <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg ?? "#eff6ff" }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor ?? "#2563eb" }} />
        </div>
      </div>
      <p className="mb-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-[30px]">
        {value}
      </p>
      <p
        className="text-xs font-medium"
        style={{ color: subColor ?? "#059669" }}
      >
        {sub}
      </p>
    </div>
  );
}

// ─── Demo Page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-slate-200 bg-white px-4 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-800 sm:text-[15px]">
            Nexora CRM
          </span>
        </div>

        {/* Auth buttons — right side */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => router.push("/auth/login")}
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-slate-200 px-3 text-sm font-semibold text-slate-600 sm:px-4"
          >
            Log in
          </Button>
          <Button
            onClick={() => router.push("/auth/signup")}
            size="sm"
            className="h-9 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 sm:px-4"
          >
            Sign up free
          </Button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex w-full flex-1 flex-col">
        {/* Hero */}
        <section className="flex w-full flex-col items-center border-b border-slate-200 bg-white px-4 py-14 text-center sm:px-8 sm:py-18 lg:py-20">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
            <Sparkles className="h-3 w-3" />
            AI-powered lead management
          </div>

          {/* Headline */}
          <h1 className="mb-5 max-w-[800px] text-[clamp(32px,7vw,64px)] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Track, nurture, and{" "}
            <span className="text-indigo-600">close deals</span> faster.
          </h1>

          <p className="mb-9 max-w-[500px] text-base leading-relaxed text-slate-500 sm:text-[17px]">
            One clean workspace for your entire pipeline — from first touch to
            signed contract.
          </p>

          {/* CTA buttons */}
          <div className="mb-4 flex w-full max-w-[360px] flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-300 px-8 text-[15px] font-semibold text-slate-700 sm:w-auto"
            >
              Log in
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-[15px] font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              Sign up free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-slate-400">
            No credit card required · Free 14-day trial
          </p>
        </section>
      </main>
    </div>
  );
}
