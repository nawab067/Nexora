'use client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sparkles,
    Users,
    TrendingUp,
    DollarSign,
    BarChart2,
    CheckCircle2,
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
        <div
            style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                padding: "20px",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>{label}</p>
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: iconBg ?? "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon style={{ width: "16px", height: "16px", color: iconColor ?? "#2563eb" }} />
                </div>
            </div>
            <p style={{ fontSize: "30px", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.02em", marginBottom: "4px" }}>
                {value}
            </p>
            <p style={{ fontSize: "12px", fontWeight: 500, color: subColor ?? "#059669" }}>{sub}</p>
        </div>
    );
}

// ─── Feature bullet ───────────────────────────────────────────────────────────
function Feature({ text }: { text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 style={{ width: "16px", height: "16px", color: "#10b981", flexShrink: 0 }} />
            <span style={{ fontSize: "14px", color: "#475569" }}>{text}</span>
        </div>
    );
}

// ─── Demo Page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
    const router = useRouter();
    return (
        
        <div
            style={{
                width: "100vw",
                minHeight: "100vh",
                marginLeft: "calc(-50vw + 50%)",   // escape centered containers
                backgroundColor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                fontFamily: "inherit",
                overflowX: "hidden",
            }}
        >
            {/* ── Navbar ── */}
            <header
                style={{
                    width: "100%",
                    height: "56px",
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "32px",
                    paddingRight: "32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    flexShrink: 0,
                }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Sparkles style={{ width: "16px", height: "16px", color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                        Nexora CRM
                    </span>
                </div>

                {/* Nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "28px", marginLeft: "40px" }}>
                    {["Features", "Pricing", "Customers", "Docs"].map((item) => (
                        <button
                            key={item}
                            style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Auth buttons — right side */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Button
                        onClick={() => router.push("/auth/login")}
                        variant="outline"
                        size="sm"
                        style={{ height: "36px", padding: "0 16px", fontSize: "14px", fontWeight: 600, borderColor: "#e2e8f0", color: "#475569", borderRadius: "8px" }}
                    >
                        Log in
                    </Button>
                    <Button
                        onClick={() => router.push("/auth/signup")}
                        size="sm"
                        style={{ height: "36px", padding: "0 16px", fontSize: "14px", fontWeight: 600, backgroundColor: "#2563eb", color: "#fff", borderRadius: "8px" }}
                    >
                        Sign up free
                    </Button>
                </div>
            </header>

            {/* ── Main ── */}
            <main style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column" }}>

                {/* Hero */}
                <section
                    style={{
                        width: "100%",
                        padding: "72px 32px 56px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#2563eb",
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "6px 12px",
                            borderRadius: "999px",
                            marginBottom: "24px",
                        }}
                    >
                        <Sparkles style={{ width: "12px", height: "12px" }} />
                        AI-powered lead management
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontSize: "clamp(36px, 5vw, 64px)",
                            fontWeight: 800,
                            color: "#0f172a",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            marginBottom: "20px",
                            maxWidth: "800px",
                        }}
                    >
                        Track, nurture, and{" "}
                        <span style={{ color: "#2563eb" }}>close deals</span>{" "}
                        faster.
                    </h1>

                    <p
                        style={{
                            fontSize: "17px",
                            color: "#64748b",
                            lineHeight: 1.7,
                            marginBottom: "36px",
                            maxWidth: "500px",
                        }}
                    >
                        One clean workspace for your entire pipeline — from first touch to signed contract.
                    </p>

                    {/* CTA buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <Button
                            onClick={() => router.push("/auth/login")}
                            variant="outline"
                            style={{
                                height: "48px",
                                padding: "0 32px",
                                fontSize: "15px",
                                fontWeight: 600,
                                borderColor: "#cbd5e1",
                                color: "#334155",
                                borderRadius: "10px",
                            }}
                        >
                            Log in
                        </Button>
                        <Button
                            onClick={() => router.push("/auth/signup")}
                            style={{
                                height: "48px",
                                padding: "0 32px",
                                fontSize: "15px",
                                fontWeight: 600,
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            Sign up free
                            <ArrowRight style={{ width: "16px", height: "16px" }} />
                        </Button>
                    </div>

                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                        No credit card required · Free 14-day trial
                    </p>
                </section>

                {/* ── Stat cards — full bleed ── */}
                <section style={{ width: "100%", padding: "32px 32px" }}>
                    <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                        <StatCard
                            icon={Users}
                            label="Total Active Leads"
                            value="12,400+"
                            sub="+12% from last month"
                            subColor="#059669"
                            iconBg="#eff6ff"
                            iconColor="#2563eb"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Pipeline Value"
                            value="$4.2M"
                            sub="Goal: $5M this quarter"
                            subColor="#64748b"
                            iconBg="#f0fdf4"
                            iconColor="#059669"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Conversion Rate"
                            value="24.8%"
                            sub="Nurture time: 14 days avg"
                            subColor="#64748b"
                            iconBg="#f5f3ff"
                            iconColor="#7c3aed"
                        />
                        <StatCard
                            icon={BarChart2}
                            label="Win Rate"
                            value="62%"
                            sub="+5% vs Q3 baseline"
                            subColor="#059669"
                            iconBg="#2563eb"
                            iconColor="#ffffff"
                        />
                    </div>
                </section>

                <Separator style={{ width: "calc(100% - 64px)", margin: "0 32px" }} />

                {/* ── Features strip ── */}
                <section
                    style={{
                        width: "100%",
                        padding: "28px 32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "48px",
                        flexWrap: "wrap",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <Feature text="AI-powered email outreach per lead" />
                    <Feature text="Real-time pipeline & conversion analytics" />
                    <Feature text="Team collaboration with role-based access" />
                    <Feature text="CSV export & third-party integrations" />
                </section>
            </main>

            {/* ── Footer ── */}
            <footer
                style={{
                    width: "100%",
                    height: "48px",
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "32px",
                    paddingRight: "32px",
                    flexShrink: 0,
                }}
            >
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    © {new Date().getFullYear()} LeadFlow CRM. All rights reserved.
                </p>
                <div style={{ marginLeft: "auto", display: "flex", gap: "24px" }}>
                    {["Privacy", "Terms", "Support"].map((l) => (
                        <button key={l} style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                            {l}
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
}